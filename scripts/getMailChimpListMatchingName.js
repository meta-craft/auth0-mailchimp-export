'use strict';

var getMailChimpListMatchingName = function (config, mailchimp) {
  var MAILCHIMP_LIST_NAME = config.MAILCHIMP_LIST_NAME;
  return function (users, callback) {
    mailchimp.lists_list({
        filters: {
          list_name: MAILCHIMP_LIST_NAME
        }
      }, function (err, result) {
        if (err) {
          console.error(err);
          return callback(err);
        }
        var list = result.data[0];
        var mailChimpListId = list.id;
        var mailChimpListName = list.name;
        console.log('AME: MailChimp list ID/name: ' + mailChimpListId + ' / ' + mailChimpListName);
        return callback(null, {mailChimpList: list, auth0Users: users});
      });
  };
};

module.exports = getMailChimpListMatchingName;
