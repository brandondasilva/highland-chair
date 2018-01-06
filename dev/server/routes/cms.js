
'use strict';

var moment = require('moment-timezone');

var express = require('express');
var request = require('request');
var router = express.Router();

router.get ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var result = {
    "update": true,
    "type": "Dining",
    "additionalPages": 2
  }

  res.send(result);
});

module.exports = router;
