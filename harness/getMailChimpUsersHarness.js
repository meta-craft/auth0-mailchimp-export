'use strict';

/**
 *  JUST FOR TESTING THE CORE LOGIC ONLY - NOT PART OF EXTENSION
 */

var async = require('async');
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var R = require('ramda');

var MAILCHIMP_API_KEY = 'YOUR_MAILCHIMP_API_KEY';
var MAILCHIMP_LIST_NAME = 'YOUR_MAILCHIMP_LIST_NAME';

var config = {
  MAILCHIMP_API_KEY: MAILCHIMP_API_KEY,
  MAILCHIMP_LIST_NAME: MAILCHIMP_LIST_NAME,
};

try {
  var mailchimp = new MailChimpAPI(config.MAILCHIMP_API_KEY, {version: '2.0'});
} catch (error) {
  return console.error(error.message);
}

var _getMailChimpListMatchingName = require('../scripts/getMailChimpListMatchingName')(config, mailchimp);
var getMailChimpUsers = require('../scripts/getMailChimpUsers')(mailchimp);

async.waterfall([
  R.curry(_getMailChimpListMatchingName)([]),
    getMailChimpUsers
    ],
    function (err) {
        if (err) {
            console.error('Error occurred');
            console.error(err);
            return;
          }
          console.log('all good, working');
          console.log('users count: ' + users.length);
    }
);
