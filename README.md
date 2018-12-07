# Simple Express Login

This user authentication page should:
* Properly sign-up users by doing the following:
  * create new users
  * securely encrypt user passwords
  * generate user token to be stored on the client-side
  * respond with a status 201 and important user info
* Properly log users in by doing the following:
  * verify that the username and password matches a record within the database
  * regenerate a user's token to restore client-side 
  * respond with status 200 and pertinent user information
