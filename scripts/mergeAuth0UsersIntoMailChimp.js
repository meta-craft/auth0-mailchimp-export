'use strict';

const Q = require("q");

const subscribe = (mailchimp, listId, users) => {

  const deferred = Q.defer();

  var list = {
    id: listId,
    batch: [],
    double_optin: false,
    update_existing: true,
    replace_interests: true
  };

  var size = 2000, total = users.length, processed = 0, count = 1;
  var total_pages = parseInt((users.length / size), 10) + 1;

  console.log('AME: Beginning Mailchimp subscription (' + total_pages + ' total calls required)');

  var synchronizeToMailchimp = function(start) {
    list.batch = users.splice(start, size);

    console.log('AME: Subscribing to Mailchimp, please wait (' + count + '/' + total_pages + ') ...');
    mailchimp.lists_batch_subscribe(
      list,
      function (err, res) {
        if (err) {          
          return deferred.reject(err)          
        }

        processed += size;

        console.log('AME: Mailchimp subscribe batch completed successfully; processed ' + (processed < total ? processed : total) + '/' + total + ' records');

        if (res.error_count > 0) {
          console.log('AME: ' + res.error_count + ' error(s) encountered from Mailchimp:' + JSON.stringify(res.errors));
        }

        count++;
        if (processed < total) {
            synchronizeToMailchimp(processed);
        } else {
            return deferred.resolve()            
        }
      }
    );
  };

  synchronizeToMailchimp(0);

  return deferred.promise;
}

const unsubscribe = (mailchimp, listId, users) => {

  const deferred = Q.defer();
  
  var list = {
    id: listId,
    batch: [],
    delete_member: true    
  };

  var size = 2000, total = users.length, processed = 0, count = 1;
  var total_pages = parseInt((users.length / size), 10) + 1;

  console.log('AME: Beginning Mailchimp unsubscription (' + total_pages + ' total calls required)');

  var synchronizeToMailchimp = function(start) {
    list.batch = users.splice(start, size);

    console.log(list.batch)
    console.log('AME: Unsubscribing from Mailchimp, please wait (' + count + '/' + total_pages + ') ...');

    mailchimp.lists_batch_unsubscribe(
      list,
      function (err, res) {
        if (err) {          
          return deferred.reject(err)          
        }

        processed += size;

        console.log('AME: Mailchimp unsubscribe batch completed successfully; processed ' + (processed < total ? processed : total) + '/' + total + ' records');

        if (res.error_count > 0) {
          console.log('AME: ' + res.error_count + ' error(s) encountered from Mailchimp:' + JSON.stringify(res.errors));
        }

        count++;
        if (processed < total) {
            synchronizeToMailchimp(processed);
        } else {
            return deferred.resolve()            
        }
      }
    );
  };

  synchronizeToMailchimp(0);

  return deferred.promise;
}

var mergeAuth0UsersIntoMailChimp = function (config, mailchimp) {
  return function (context, callback) {

    // Upload users (add new or update existing ones)
    const listId = context.mailChimpList.id;
    const users = context.users;
    const mailChimpUsers = context.mailChimpUsers;

    console.log('AME: ' + users.length + ' users retrieved from Auth0');

    const filteredUsers = users.filter(function (user) {
      return !user.email.includes('+');
    })

    const mailChimpUsersToSubscribe = filteredUsers.map(function (user) {
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
        
    const filteredUsersEmails = filteredUsers.map(u => u.email)
    const mailChimpUsersToDelete = mailChimpUsers.filter(e => !filteredUsersEmails.includes(e))

    console.log('AME: ' + mailChimpUsersToDelete.length + ' MailChimp email addresses to remove');
    console.log('AME: ' + mailChimpUsersToSubscribe.length + ' valid email address users to synchronize with Mailchimp');

    Promise.all([
      unsubscribe(mailchimp, listId, mailChimpUsersToDelete.map(e => ({ email: e }))),
      subscribe(mailchimp, listId, mailChimpUsersToSubscribe)
    ]).then(_ => {
      callback(null, context)
    })
    .catch(err => {
      console.error('AME: ' + err);
      callback(err)    
    })
  };
};

module.exports = mergeAuth0UsersIntoMailChimp;
