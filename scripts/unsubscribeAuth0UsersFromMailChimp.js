'use strict';

var unsubscribeAuth0UsersFromMailchimp = function (config, mailchimp) {
  return function (context, callback) {

    // Remove users (existing ones)
    var listId = context.mailChimpList.id;
    var users = context.users;

    console.log('AME: ' + users.length + ' users retrieved from Auth0 for removal');

    var complete = users.filter(function (user) {
      return !user.email.includes('+');
    }).map(function (user) {
      return {
        email: user.email
      };
    });

    console.log('AME: ' + complete.length + ' valid email address users to remove from Mailchimp');

    var list = {
      id: listId,
      batch: [],
      delete_member: false,
      send_goodbye: false,
      send_notify: false
    };

    var size = 2000, total = complete.length, processed = 0, count = 1;
    var total_pages = parseInt((complete.length / size), 10) + 1;

    console.log('AME: Beginning Mailchimp synchronization (' + total_pages + ' total calls required)');

    var synchronizeToMailchimp = function(start) {
        list.batch = complete.splice(start, size);

        console.log('AME: Synchronizing with Mailchimp, please wait (' + count + '/' + total_pages + ') ...');
        mailchimp.lists_batch_unsubscribe(
          list,
          function (err, res) {
            if (err) {
              console.error('AME: ' + err);
              return callback(err);
            }

            processed += size;

            console.log('AME: Mailchimp batch list removal completed successfully; processed ' + (processed < total ? processed : total) + '/' + total + ' records');

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

module.exports = unsubscribeAuth0UsersFromMailchimp;
