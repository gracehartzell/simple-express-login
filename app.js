const USER = require('./models/user.js');


app.post('./signup', USER.signup);
app.post('/signin', USER.signin);