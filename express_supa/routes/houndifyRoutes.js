const express = require('express');
const router = express.Router();
const Houndify = require('houndify');
const supabase = require('../config/supabaseClient');
const { decrypt } = require('../config/encryption');

let houndifyCredentials = {};
let modelName;
let clientId;
let chatbotName;
let actionType;
let specialConfig;

router.get("/startHound/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login if not logged in
}
  const id = req.params.id;
  const credentials = await supabase
      .from('chatbots')
      .select('*')
      .eq("id", id)
  
  const previewUrl = credentials.data[0].preview_url;
  const client_id = credentials.data[0].client_id;
  const client_key = decrypt(credentials.data[0]);
  houndifyCredentials = {'client_id': client_id, 'client_key': client_key}
  modelName = credentials.data[0].model_name;
  clientId = credentials.data[0].client_id;
  chatbotName = credentials.data[0].name;
  actionType = credentials.data[0].action_type;
  if (actionType === "sendFullConversation") {
    specialConfig = credentials.data[0].full_convo_config
  }
  else if (actionType === "keywords") {
    specialConfig = credentials.data[0].keyword_config
  }
  else if (actionType === "custom") {
    specialConfig = credentials.data[0]. custom_config
  }
  res.json({ 
    'client_id': houndifyCredentials.client_id,
    'modelName': modelName,
    'previewUrl': previewUrl
  });

});

router.get('/houndifyAuth', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login if not logged in
}
  const authHandler = Houndify.HoundifyExpress.createAuthenticationHandler({ 
    clientId: houndifyCredentials.client_id, 
    clientKey: houndifyCredentials.client_key
  });
  
  authHandler(req, res, next);
});
  
router.get('/startChat', (req, res) => {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login if not logged in
}
  res.render('startChat', {
    modelName: modelName, 
    clientId: clientId,
    chatbotName: chatbotName,
    actionType: actionType, 
    specialConfig: specialConfig
  });
});

module.exports = router;