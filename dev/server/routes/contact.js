
'use strict';

const clientName = "Highland Chair Co.";
const clientEmail = "info@highlandchair.com" // TODO Change to actual domain

var moment = require('moment-timezone');

var express = require('express');
var request = require('request');
var router = express.Router();

var helper = require('sendgrid').mail;
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

router.get ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.send('API v1 GET: Hello World!');
});

router.post ('/', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');

  req.body['name'] = req.body['first-name'] + " " + req.body['last-name'];

  // Configuring the email parameters for composing
  var from_email = new helper.Email(clientEmail, clientName);
  var to_email = new helper.Email('brandon@bdsdesign.co'); // TODO Change to email
  var user_email = new helper.Email(req.body['email'], req.body['name']);
  var client_subject = "New contact form submission on the " + clientName + " website!";
  var user_subject = clientName + " - Contact Form Submission Confirmation";

  // Construct email requests to be sent to MTG and a confirmation to the user using custom made templates
  var request1 = composeMail(user_email, client_subject, to_email, req.body, process.env.CONTACT_CLIENT_TEMPLATE);
  var request2 = composeMail(from_email, user_subject, user_email, req.body, process.env.CONTACT_USER_TEMPLATE);

  // Setting up the Slack post messages
  var slackParams = {
    "form": {
      "attachments": [
        {
          "fallback": "A new form on the " + clientName + " website has been submitted!",
          "pretext": "A new form on the " + clientName + " website has been submitted!",
          "title": "New Contact Form Submission",
          "text": "The contents of the form are outline below for reference.",
          "fields": [
            {
              "title": "First Name",
              "value": req.body['first-name'],
              "short": true
            }, {
              "title": "Last Name",
              "value": req.body['last-name'],
              "short": true
            }, {
              "title": "Email Address",
              "value": req.body['email'],
              "short": false
            }, {
              "title": "Subject",
              "value": req.body['subject'],
              "short": false
            }, {
              "title": "Message",
              "value": req.body['message'],
              "short": false
            }, {
              "title": "Added to mailing list?",
              "value": (req.body['mailing-list'] == 'true') ? "Yes" : "No",
              "short": false
            }
          ]
        }
      ]
    },
    "mailing-list": {
      "attachments": [
        {
          "fallback": "A new contact has subscribed to the mailing list!",
          "color": "#1BDB6C",
          "pretext": "A new contact has subscribed to the mailing list!",
          "title": "New Contact Added to the Mailing List",
          "text": "The new subscriber's information and upload status is outlined below.",
          "fields": [
            {
              "title": "First Name",
              "value": req.body['first-name'],
              "short": true
            }, {
              "title": "Last Name",
              "value": req.body['last-name'],
              "short": true
            }, {
              "title": "Email Address",
              "value": req.body['email'],
              "short": false
            }
          ]
        }
      ]
    }
  }

  // Check to see if they want to be added to the mailing list
  if (req.body['mailing-list'] == 'true') {

    var contactRequest = sg.emptyRequest({
      method: 'POST',
      path: '/v3/contactdb/recipients',
      body: [{
        "email": req.body['email'],
        "first_name": req.body['first-name'],
        "last_name": req.body['last-name']
      }]
    });

    sendgridContactRequest(contactRequest, slackParams['mailinglist']);
  }

  sendgridRequest(request1, undefined);
  sendgridRequest(request2, undefined);

  slackPost(slackParams['form'], process.env.SLACK_WEBHOOK_URL);

  res.send(req.body);
});


/**
 * Set up the mail information and template to be requested to be sent through SendGrid
 *
 * @param {String} from_email "From" email
 * @param {String} subject Subject for the email
 * @param {String} to_email "To" email
 * @param {Object} form_data The information submitted on the form
 * @param {String} template_id The ID of the template to use when sending the email
 */
function composeMail(from_email, subject, to_email, form_data, template_id) {

  var content = new helper.Content("text/html", form_data['message']);

  var mail = new helper.Mail(from_email, subject, to_email, content); // Create mail helper

  // Set up personalizations for the email template using the form data from the parameters
  mail.personalizations[0].addSubstitution( new helper.Substitution('-name-', form_data['name']) );
  mail.personalizations[0].addSubstitution( new helper.Substitution('-firstname-', form_data['first-name']) );
  mail.personalizations[0].addSubstitution( new helper.Substitution('-email-', form_data['email']) );
  mail.personalizations[0].addSubstitution( new helper.Substitution('-subject-', form_data['subject']) );

  mail.setTemplateId(template_id); // Set the Template ID for the email content

  // Return request to send to the SendGrid API
  return sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });
}

/**
 * Sends the SendGrid request to the API
 *
 * @param {Object} req The callback to send to SendGrid
 * @param {Object} slackReq The attachment content to post on Slack
 */
function sendgridRequest(req, slackReq) {

  sg.API(req, function(error, response) {

    if (response.statusCode == 200 || response.statusCode == 202 || response.statusCode == 201) {

      if (slackReq == undefined) {

        // Confirmation response
        var confirmationRes = {
          "attachments": [
            {
              "fallback": "SendGrid Email Request Successful!",
              "color": "#1BDB6C",
              "pretext": "SendGrid Email Request Successful!",
              "title": "SendGrid Email Request Successful!",
              "text": "The SendGrid request has been sent. Below is the response from SendGrid.",
              "fields": [
                {
                  "title": "Status Code",
                  "value": response.statusCode,
                  "short": true
                }, {
                  "title": "Response Body",
                  "value": "```" + JSON.stringify(response.body) + "```",
                  "short": false
                }, {
                  "title": "Response Headers",
                  "value": "```" + JSON.stringify(response.headers) + "```",
                  "short": false
                }
              ]
            }
          ]
        }

        // Post to Slack
        slackPost(confirmationRes, process.env.SLACK_WEBHOOK_URL);

      } else {

        // If the slackReq parameter is defined, then add the status code, headers
        // and response
        slackReq['attachments'][0]['fallback'] = "SendGrid Contact Request Successful!";
        slackReq['attachments'][0]['pretext'] = "SendGrid Contact Request Successful!";
        slackReq['attachments'][0]['title'] = "SendGrid Contact Request Successful!";

        slackReq['attachments'][0]['fields'].push(
          {
            "title": "Status Code",
            "value": response.statusCode,
            "short": true
          }, {
            "title": "Response Body",
            "value": "```" + JSON.stringify(response.body) + "```",
            "short": false
          }, {
            "title": "Response Headers",
            "value": "```" + JSON.stringify(response.headers) + "```",
            "short": false
          }
        );

        // Post to Slack
        slackPost(slackReq, process.env.SLACK_WEBHOOK_URL);

      }

    } else {

      // Error response
      var errorRes = {
        "attachments": [
          {
            "fallback": "SENDGRID REQUEST FAILED",
            "color": "#C10039",
            "pretext": "SENDGRID REQUEST FAILED!",
            "title": "SENDGRID REQUEST FAILED!",
            "text": "The response from SendGrid is displayed below for more information.",
            "fields": [
              {
                "title": "Status Code",
                "value": response.statusCode,
                "short": true
              }, {
                "title": "Response Body",
                "value": "```" + JSON.stringify(response.body) + "```",
                "short": false
              }, {
                "title": "Response Headers",
                "value": "```" + JSON.stringify(response.headers) + "```",
                "short": false
              }
            ]
          }
        ]
      }

      if (slackReq != undefined) {
        errorRes['attachments'][0]['text'] += "\nThis request is for the SendGrid Contacts API";
      }

      // Post to Slack
      slackPost(errorRes, process.env.SLACK_WEBHOOK_URL);

    }

    // Log response
    console.log('--RESPONSE BEGIN--');
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
    console.log('--RESPONSE END--\n');
  });
}

/**
 * Secondary SendGrid request to the API for uploading Contacts and segmenting them to the mailing list
 *
 * @param {Object} req The callback to send to SendGrid
 * @param {Object} slackReq The attachment content to post on Slack
 */
function sendgridContactRequest(req, slackReq) {

  sg.API(req, function(error, response) {

    // Log response
    console.log('--RESPONSE BEGIN--');
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
    console.log('--RESPONSE END--\n');

    var reqPath = '/v3/contactdb/lists/' + process.env.LIST_ID_MAILING + '/recipients/' + response.body['persisted_recipients'][0];

    // Request to add the newly added contact to the appropriate list
    var mailinglistRequest = sg.emptyRequest({
      method: 'POST',
      path: reqPath
    });

    sendgridRequest(mailinglistRequest, slackReq);
  });
}

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
