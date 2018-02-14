
'use strict';

const express = require('express');
const PORT = process.env.PORT || 3000;

var auth = require('http-auth');
var basic = auth.basic({
  realm: "Restricted Access!"
}, function(username, password, callback) {
  callback((username === process.env.AUTH_USER && password === process.env.AUTH_PASS));
});

var app = express();
var bodyParser = require('body-parser');
var helmet = require('helmet');

app.set('port', PORT);

app.use(auth.connect(basic));
var server = require('http').createServer(basic);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

// Contact Form
var contact = require('./routes/contact');
app.use('/contact', contact);

// CMS Entry Checker
var cms = require('./routes/cms');
var dining = require('./routes/cms/dining');
var bar = require('./routes/cms/bar');
app.use('/cms', cms);
app.use('/cms/dining', dining);
app.use('/cms/bar', bar);

app.get('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  res.send('ok');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
