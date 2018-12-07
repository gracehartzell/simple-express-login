// SETTING THINGS UP 
const environment = process.env.NODE_ENV || 'development';      // setting up the environment
const configuration = require('../../knexfile')[environment];   // grab the right db through env configs
const database = require('knex')(configuration);                // define database from inputs above
const bcrypt = require('bcrypt');                               // password encryption for db
const crypto = require('crypto');                               // built-in encryption node module


// -------------------- SIGN-UP -------------------- \\
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


// HELPER FUNCTIONS
const hashPassword = (password) => {
  return new Promise((resolve, reject) => 
    bcrypt.hash(password, 10, (err, hash) => {
      err ? reject(err) : resolve(hash)
    })
  );
};

const createUser = user => {
  return database.raw(
    `INSERT INTO users (username, password_digest, token, created_at
      VALUES (?, ?, ?, ?) 
      RETURNING id, username, created_at, token`,
      [user.username, user.password_digest, user.token, new Date()]
  )
  .then((data) => data.rows[0])
};

const createToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, data) => {
      err ? reject(err) : resolve(data.toString('base64'))
    });
  });
};

// -------------------- SIGN-IN -------------------- \\
const signin = (req, res) => {
  const userReq = req.body;                                           // get user info from req body
  let user;

  findUser(userReq)                                                   // find user based on username above
    .then((foundUser) => {
      user = foundUser;
      return checkPassword(userReq.password, foundUser)               // check the password_digest against pw from request
    })
    .then((res) => createToken())                                     // if correct, create/save new token for user
    .then(token => updateUserToken(token, user))
    .then(() => {
      delete user.password_digest
      res.status(200).json(user)                                      // send back json of token/user info to client 
    })
    .catch((err) => console.error(err));
};

// HELPER FUNCTIONS
const findUser = userReq => {
  return database.raw(
    `SELECT * FROM users WHERE username = ?`,
    [userReq.username]
  )
  .then((data) => data.rows[0])
}

const checkPassword = (reqPassword, foundUser) => {
  return new Promise((resolve, reject) => 
    bcrypt.compare(reqPassword, foundUser.password_digest, (err, response) => {
      if (err) {
        reject(err)
      }
      else if (response) {
        resolve(response)
      } else{
        reject(new Error('Passwords do not match!'))
      }
    })
  );
};

const updateUserToken = (token, user) => {
  return database.raw(`
    UPDATE users SET token = ? WHERE id = ?
    RETURNING id, username, token`,
    [token, user.id])
    .then(data => data.rows[0])
};

module.exports = {
  signup,
  signin
}
