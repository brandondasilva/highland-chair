
'use strict';

var express = require('express');
var router = express.Router();

// Set up and configure Webflow
var Webflow = require('webflow-api');
var webflow = new Webflow({ token: process.env.WEBFLOW_TOKEN });

router.get ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  var dining = webflow.items({ collectionId: process.env.WEBFLOW_DINING_ID });

  dining.then(function(i){
    res.send({ "bar-count": i.count });
  });
});

module.exports = router;
