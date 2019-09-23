const express = require('express');

const slackController = require('../controllers/slackController');
const jwtController = require('../controllers/jwtController')
const sentimentController = require('../controllers/sentimentController');
const router = express.Router();

router.get('/', jwtController.verify, slackController.getHistory, sentimentController.parseData, (req, res) => {
  const { sentimentData } = res.locals;
  return res.status(200).json(sentimentData);
});

router.get('/channels', jwtController.verify, slackController.getChannels, (req, res) => {
  const { channels } = res.locals;
  return res.status(200).json(channels);
});

// This route handles get request to a /oauth endpoint. We'll use this endpoint for handling the logic of the Slack oAuth process behind our app.
router.get('/auth', slackController.oAuth, jwtController.create, (req, res) => {
  const { token } = res.locals;
  res.cookie('token', token, { httpOnly: true });
  return res.redirect('/');
});

module.exports = router;