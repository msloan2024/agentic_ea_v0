const express = require('express');
const router = express.Router();
const Houndify = require('houndify');
const fs = require('fs');

/* This is for PRODUCTION!!!*/

const clientId = fs.readFileSync('/run/secrets/hound_stt_id', 'utf8').trim();
const clientKey = fs.readFileSync('/run/secrets/hound_stt_key', 'utf8').trim();
const ttsClientId = fs.readFileSync('/run/secrets/hound_tts_id', 'utf8').trim();
const ttsClientKey = fs.readFileSync('/run/secrets/hound_tts_key', 'utf8').trim();



/* The below 9 lines are for DEV!!!

const path = require('path');
const secretPath1 = path.join(__dirname, '..', '..', 'secrets', 'hound_stt_id');
const clientId = fs.readFileSync(secretPath1, 'utf8').trim();
const secretPath2 = path.join(__dirname, '..', '..', 'secrets', 'hound_stt_key');
const clientKey = fs.readFileSync(secretPath2, 'utf8').trim();
const secretPath3 = path.join(__dirname, '..', '..', 'secrets', 'hound_tts_id');
const ttsClientId = fs.readFileSync(secretPath3, 'utf8').trim();
const secretPath4 = path.join(__dirname, '..', '..', 'secrets', 'hound_tts_key');
const ttsClientKey = fs.readFileSync(secretPath4, 'utf8').trim();
*/


function ttsRequest(summary){ 
  return new Promise((resolve, reject) => {
    new Houndify.TextRequest({
      query: `say ${summary}`,
    
      clientId: ttsClientId,
      clientKey: ttsClientKey,
    
      requestInfo: {
        UserID: "test_user",
        Latitude: 37.388309,
        Longitude: -121.973968,
        ResponseAudioVoice: "Echo",
        ResponseAudioShortOrLong: "Short",
        ReturnResponseAudioAsURL: true,
        ResponseAudioAcceptedEncodings: ['Opus']
      },
      conversationState: null,
    
      onResponse: (response, info) => {
        resolve(response.AllResults[0].ResponseAudioURL);
      },
      onError: (err, info) => {
        reject(err);
      },
      });
  })
};

let conversation_history = [];  

router.get('/wallboard', (req, res) => {
    if (!req.session.user) {
      return res.redirect("/"); // Redirect to login if not logged in
  }
  conversation_history = [];  
  res.render('wallboard', {
      clientId: clientId
    });
  });
  
router.post('/agentChat', async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login if not logged in
}
  const transcription = req.body.transcription;
  const message_history = req.body.message_history;

/* 
LocalHost is for DEV!!!
http://fastapi-app:8000 is for PROD!!!
*/


  const graphOutput = await fetch('http://fastapi-app:8000/graph', {
  // const graphOutput = await fetch('http://localhost:8000/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({transcription: transcription, message_history: message_history})
  });
  const graphOutputData = await graphOutput.json()
  const message = graphOutputData.output
  try{
    const audioUrl = await ttsRequest(message);
    res.json({
      message,
      audioUrl: audioUrl
    });
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS failed' });
  }
});
  
router.get('/houndSTTAuth', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/"); // Redirect to login if not logged in
}
  const authHandler = Houndify.HoundifyExpress.createAuthenticationHandler({ 
    clientId: clientId,
    clientKey: clientKey
  });
  
  authHandler(req, res, next);
});

module.exports = router;