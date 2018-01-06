
'use strict';

var moment = require('moment-timezone');

var express = require('express');
var request = require('request');
var router = express.Router();

router.get ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.send('API v1 GET: Hello World!');
});

router.post ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var result = {};
  var origB = req.body['orig-bar'];
  var currB = req.body['curr-bar'];
  var origD = req.body['orig-dining'];
  var currD = req.body['curr-dining'];

  var x1 = Math.floor(origB/6);
  var x2 = Math.floor(currB/6);
  var y1 = Math.floor(origD/6);
  var y2 = Math.floor(currD/6);

  if ((x1 == x2) && (y1 == y2)) {

    result = {
      "update": false,
      "dining-count": currD,
      "bar-count": currB,
      "todo": "",
      "description": ""
    }

  } else if ((x1 != x2) && (y1 != y2)) {

    var todo = "Both Dining and Bar CMS pages need edits on Highland";
    var description = "The dining page requires " + y2 + " pages and the bar page requires " + x2 + " pages.";

    result = {
      "update": true,
      "dining-count": currD,
      "bar-count": currB,
      "todo": todo,
      "description": description
    }

  } else {

    if (x1 != x2) {
      var todo = "Change Bar page count on Highland";
      var description = "The bar page requires " + x2 + " pages.";

      result = {
        "update": true,
        "dining-count": currD,
        "bar-count": currB,
        "todo": todo,
        "description": description
      }
    }

    if (y1 != y2) {
      var todo = "Change Dining page count on Highland";
      var description = "The dining page requires " + y2 + " pages.";

      result = {
        "update": true,
        "dining-count": currD,
        "bar-count": currB,
        "todo": todo,
        "description": description
      }
    }
  }

  res.send(result);
});

module.exports = router;
