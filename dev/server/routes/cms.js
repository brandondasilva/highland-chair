
'use strict';

var moment = require('moment-timezone');

var express = require('express');
var request = require('request');
var router = express.Router();

router.get ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  

  res.send('API v1 GET: Hello World!');
});

module.exports = router;
