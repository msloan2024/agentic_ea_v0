const express = require('express');
const router = express.Router();
const Houndify = require('houndify');
const supabase = require('../config/supabaseClient');
const fs = require('fs');

const diyDepotClientId = 'P92I5XLCtTafDREMvTl8Vw==';

/* This is for PRODUCTION!!!*/

const diyDepotClientKey = fs.readFileSync('/run/secrets/diy_depot_client_key', 'utf8').trim();


/* The below 3 lines are for DEV!!!

const path = require('path');
const secretPath1 = path.join(__dirname, '..', '..', 'secrets', 'diy_depot_client_key');
const diyDepotClientKey = fs.readFileSync(secretPath1, 'utf8').trim();
*/

router.get('/houndifyAuthMCdemo', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login if not logged in
}
  const authHandler = Houndify.HoundifyExpress.createAuthenticationHandler({ 
    clientId: diyDepotClientId, 
    clientKey: diyDepotClientKey
  });
  
  authHandler(req, res, next);
});
  
router.get('/metroclick', async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login if not logged in
}
    const metroclick_database = await supabase
        .from('chatbots')
        .select('*')
        .eq("id", 15)
  
  const keywords = Array(metroclick_database.data[0].metroclick_keywords);
  res.render('metroclick', {
    keywords: keywords,

  });
});

module.exports = router;