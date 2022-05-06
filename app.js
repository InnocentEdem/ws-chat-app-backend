
var express = require('express');
var app = express();
const { expressjwt: jwt } = require("express-jwt");
var jwks = require('jwks-rsa');
var cors = require('cors')
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
  console.log("App listening",PORT);
})

app.use(cors());
app.options('/', cors())

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

app.get('/authorized',cors(), async function (req, res) {
  try{
  const database = new dbservice;
  const user = req.auth['https://localhost:3000/claims/email']
  await database.createNewUser(user)
  const token = req.headers.authorization.split(' ')[1]
  const result = await database.addToWhitelist(token)
  res.json([result]);
  }catch(err){
    res.status(401).send({"err":error})  }
});
webSocketServer(server)

