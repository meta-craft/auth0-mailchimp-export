'use strict';

var mergeAuth0UsersIntoMailChimp = function (config, mailchimp) {
  return function (context, callback) {

    // Upload users (add new or update existing ones)
    var listId = context.mailChimpList.id;
    var users = context.auth0Users;

    console.log('AME: ' + users.length + ' users retrieved from Auth0');

    var complete = users.filter(function (user) {
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
    });

    console.log('AME: ' + complete.length + ' valid email address users to synchronize with Mailchimp');

    var list = {
      id: listId,
      batch: [],
      double_optin: false,
      update_existing: true,
      replace_interests: true
    };

    var size = 2000, total = complete.length, processed = 0, count = 1;
    var total_pages = parseInt((complete.length / size), 10) + 1;

    console.log('AME: Beginning Mailchimp synchronization (' + total_pages + ' total calls required)');

    var synchronizeToMailchimp = function(start) {
        list.batch = complete.splice(start, size);

        console.log('AME: Synchronizing with Mailchimp, please wait (' + count + '/' + total_pages + ') ...');
        mailchimp.lists_batch_subscribe(
          list,
          function (err, res) {
            if (err) {
              console.error('AME: ' + err);
              return callback(err);
            }

            processed += size;

            console.log('AME: Mailchimp batch list update completed successfully; processed ' + processed + '/' + total + ' records');

            if (res.error_count > 0) {
              console.log('AME: ' + res.error_count + ' error(s) encountered from Mailchimp:' + JSON.stringify(res.errors));
            }

            count++;
            if (processed < total) {
                synchronizeToMailchimp(processed);
            } else {
                return callback(null, context)
            }
          }
        );
    };

    synchronizeToMailchimp(0);
  };
};

module.exports = mergeAuth0UsersIntoMailChimp;
