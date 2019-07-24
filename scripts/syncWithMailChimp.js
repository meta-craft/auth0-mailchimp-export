'use strict';

var MailChimpAPI = require('mailchimp').MailChimpAPI;
var async = require('async');
var Q = require("q");

var syncWithMailChimp = function (config) {
  var MAILCHIMP_API_KEY = config.MAILCHIMP_API_KEY;
  try {
    console.log('AME: Attempting to connect to MailChimp API');
    var mailchimp = new MailChimpAPI(MAILCHIMP_API_KEY, {version: '2.0'});
  } catch (error) {
    return console.log(error.message);
  }

  console.log('AME: Mailchimp API created');

  var _getMailChimpListMatchingName = require('./getMailChimpListMatchingName')(config, mailchimp);
  var _getAuth0Users = require('./getAuth0Users')(config);
  var _getMailChimpUsers = require('./getMailChimpUsers')(mailchimp);
  var _mergeAuth0UsersIntoMailChimp = require('./mergeAuth0UsersIntoMailChimp')(config, mailchimp);

  var deferred = Q.defer();

  console.log('AME: Preparing user retrieval and synchronization');

  async.waterfall([
      _getAuth0Users,
      _getMailChimpListMatchingName,
      _getMailChimpUsers,
      _mergeAuth0UsersIntoMailChimp,
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

module.exports = syncWithMailChimp;
