'use strict';

var MailChimpAPI = require('mailchimp').MailChimpAPI;
var async = require('async');
var Q = require("q");

var removalSyncWithMailChimp = function (config) {
  var MAILCHIMP_API_KEY = config.MAILCHIMP_API_KEY;
  try {
    console.log('AME: Attempting to connect to MailChimp API');
    var mailchimp = new MailChimpAPI(MAILCHIMP_API_KEY, {version: '2.0'});
  } catch (error) {
    return console.log(error.message);
  }

  console.log('AME: Mailchimp API created');

  var _getMailChimpListMatchingName = require('./getMailChimpListMatchingName')(config, mailchimp);
  var _getAuth0UsersForRemoval = require('./getAuth0UsersForRemoval')(config);
  var _unsubscribeAuth0UsersFromMailChimp = require('./unsubscribeAuth0UsersFromMailChimp')(config, mailchimp);

  var deferred = Q.defer();

  console.log('AME: Preparing user retrieval and synchronization');

  async.waterfall([
      _getAuth0UsersForRemoval,
      _getMailChimpListMatchingName,
      _unsubscribeAuth0UsersFromMailChimp
    ],
    function (err) {
      if (err) {
        console.error(err);
        return deferred.reject(new Error(err));
      }
      return deferred.resolve();
    }
  );
  return deferred.promise;
};

module.exports = removalSyncWithMailChimp;
