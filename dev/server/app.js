
'use strict';

const express = require('express');
const PORT = process.env.PORT || 3000;

var app = express();
var bodyParser = require('body-parser');
var helmet = require('helmet');

app.set('port', PORT);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

// Contact Form
var contact = require('./routes/contact');
app.use('/contact', contact);

// CMS Entry Checker
var cmsCheck = require('/routes/cms');
app.use('/cms', cmsCheck);

app.get('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  res.send('ok');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
