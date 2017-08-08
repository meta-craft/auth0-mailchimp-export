'use strict';

var mergeAuth0UsersIntoMailChimp = function (config, mailchimp) {
  return function (context, callback) {
    // Upload users (add new or update existing ones)

    var listId = context.mailChimpList.id;
    var users = context.auth0Users;

    var list = {
      id: listId,
      batch: users.filter(function (user) {
        return !user.email.includes('+');
      }).map(function (user) {
        return {
          email: {
            email: user.email
          },
          email_type: 'text',
          merge_vars: {
            'FNAME': user.given_name || '',
            'LNAME': user.family_name || ''
          }
        };
      }),
      double_optin: false,
      update_existing: true,
      replace_interests: true
    };

    console.log('AME: ' + users.length + ' users retrieved from Auth0');
    console.log('AME: ' + list.batch.length + ' valid email address users to synchronize with Mailchimp');

    mailchimp.lists_batch_subscribe(
      list,
      function (err, res) {
        if (err) {
          console.error(err);
          return callback(err);
        }
        console.log('AME: Mailchimp batch list update completed successfully');

        if (res.error_count > 0) {
          console.log('AME: ' + res.error_count + ' error(s) encountered from Mailchimp:');
          console.log('AME: ' + res.errors);
        }

        return callback(null, context)
      }
    );
  };
};

module.exports = mergeAuth0UsersIntoMailChimp;
