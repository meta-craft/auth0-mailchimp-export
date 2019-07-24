'use strict';

const R = require('ramda');
const Q = require("q");

const getUsers = function (mailchimp, listId, allUsers, perPage, pageNumber) {        
    const deferred = Q.defer();    
    mailchimp.lists_members(
        {
            id: listId,            
            opts: {              
              limit: perPage,
              start: perPage * pageNumber
            }            
        },
        (err, res) => { 
            if (err) {
                return deferred.reject(err)
            } 

            const members = res.data.map(m => m.email)
            allUsers = R.concat(allUsers, members)
            if (allUsers.length < res.total) {
              return deferred.resolve(getUsers(mailchimp, listId, allUsers, perPage, pageNumber + 1))
            } else {
              return deferred.resolve(allUsers)                    
            }
        }
    )    
    return deferred.promise;
};

const getMailChimpUsers = function (mailchimp) {
  return function (context, callback) {
    const listId = context.mailChimpList.id;
    console.log(`AME: Attempting to retrieve MailChimp (${listId}) users`);    

    getUsers(mailchimp, listId, [], 1, 0).then(function (users) {
      var totalUsers = users.length;
      console.log('AME: Total number of MailChimp users: ' + totalUsers);
      return callback(null, {...context, mailChimpUsers: users});
    }, function (err) {
      console.error('ERROR: ' + err);
      callback(err);
    });
  };
};

module.exports = getMailChimpUsers;
