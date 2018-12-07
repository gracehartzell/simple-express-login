// SETTING THINGS UP 
const environment = process.env.NODE_ENV || 'development';      // setting up the environment
const configuration = require('../../knexfile')[environment];   // grab the right db through env configs
const database = require('knex')(configuration);                // define database from inputs above
const bcrypt = require('bcrypt');                               // password encryption for db
const crypto = require('crypto');                               // built-in encryption node module

const signup = (req, res) => {    
  const user = request.body                                     // get user from request body
  hashPassword(user.password)                                   // encrypt plain text pw with bcrypt  
    .then((hashedPassword) => {
      delete user.password
      user.password_digest = hashedPassword                     // set user's password_digest to encrypted pw
    })
    .then(() => createToken())                                  // create token to save user's session
    .then(token => user.token = token)                          // set user's token to created token
    .then(() => createUser(user))
    .then(user => {                                             // save user with password_digest and session
      delete user.password_digest                                 // token to database
      res.status(201).json({ user })                            // respond with 201 and json of new user info
    })
    .catch((err) => console.error(err))                         // give warning in console if error occurs
}


module.exports = {
  signup,

}
