
'use strict';

var moment = require('moment-timezone');

var express = require('express');
var request = require('request');
var router = express.Router();

router.get ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var testObj = {
    "type": "Dining",
    "additionalPages": 2
  }

  res.send(testObj);
});

module.exports = router;
