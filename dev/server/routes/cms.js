
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

  var slackParams = {
    "attachments": [
      {
        "pretext": "*Highland Chair Co. Weekly CMS Checker*",
        "username": "cms-bot"
        "mrkdwn": true
      }, {
        "pretext": "CMS Counts",
        "title": "CMS Counts for all collections",
        "text": "All of the original counts from the last check and the updates",
        "fields": [
          {
            "title": "Original Bar CMS item count:",
            "value": origB,
            "short": true
          }, {
            "title": "Current Bar CMS item count:",
            "value": currB,
            "short": true
          }, {
            "title": "Original Dining CMS item count:",
            "value": origD,
            "short": true
          }, {
            "title": "Current Dining CMS item count:",
            "value": currD,
            "short": true
          }
        ]
      }, {
        "pretext": "Pagination page counts",
        "title": "Pagination page counts",
        "text": "The original and current page counts for both CMS display pages",
        "fields": [
          {
            "title": "Original Bar page count:",
            "value": x1,
            "short": true
          }, {
            "title": "Current Bar page count:",
            "value": x2,
            "short": true
          }, {
            "title": "Original Dining page count:",
            "value": y1,
            "short": true
          }, {
            "title": "Original Dining page count:",
            "value": y2,
            "short": true
          },
        ]
      }
    ]
  }

  slackPost(slackParams);

  res.send(result);
});

/**
 * Post the content being passed into the function to Slack through the webhook.
 * This is only being sent to the channel on the BDS Slack team, so only the one
 * webhook is needed.
 *
 * @param {Object} data The content to populate the Slack post
 */
function slackPost(data) {

  request({
    url: process.env.SLACK_WEBHOOK_URL,
    method: "POST",
    json: true,
    body: data
  });
}

module.exports = router;
