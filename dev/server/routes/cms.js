
'use strict';

var moment = require('moment-timezone');

var express = require('express');
var request = require('request');
var router = express.Router();

// Set up and configure Webflow
var Webflow = require('webflow-api');
var webflow = new Webflow({ token: process.env.WEBFLOW_TOKEN });

router.get ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.send('API v1 GET: Hello World!');
});

router.post ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var dining = webflow.items({ collectionId: process.env.WEBFLOW_DINING_ID });
  var bar    = webflow.items({ collectionId: process.env.WEBFLOW_BAR_ID });

  dining.then(i => console.log(i));
  bar.then(i => console.log(i));

  var result = {
    "update": false,
    "dining-count": 14,
    "bar-count": 20,
    "type": "Dining",
    "additionalPages": 2
  }

  res.send(result);
});

module.exports = router;
