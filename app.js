
var express = require('express');
var app = express();
const { expressjwt: jwt } = require("express-jwt");
var jwks = require('jwks-rsa');
var cors = require('cors')
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');
const webSocketServer = require("./websockets")
var dbservice=require("./Services");


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



const PORT = process.env.PORT || 5003

const server = app.listen(PORT,()=>{
  console.log("server running");
  // sequelize.authenticate()
})
app.use(cors())

var jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://dev-ae4gvrfj.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'localhost:5003',
    issuer: 'https://dev-ae4gvrfj.us.auth0.com/',
    algorithms: ['RS256']
});
app.use(jwtCheck);



app.get('/authorized', async function (req, res) {
  console.log("confirmed")
  const database = new dbservice;
  const user = await database.createNewUser(req.auth['https://localhost:3000/claims/email'])
  const token = req.headers.authorization.split(' ')[1]
  const result = await database.addToWhitelist(token)
  res.json([result,user]);
});
webSocketServer(server)





// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// console.log("FFFFF")

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
