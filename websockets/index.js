const webSocket = require("ws");
const queryString = require("query-string");
const { auth } = require("express-oauth2-jwt-bearer");
const decoder = require("../controllers/decode");
const dbservice = require("../Services");

module.exports = (server) => {
  const database = new dbservice();

  const webSocketServer = new webSocket.Server({
    noServer: true,
    path: "/websockets",
  });

  server.on("upgrade", (request, socket, head) => {
    const [_path, params] = request?.url?.split("?");
    const connectionParams = queryString.parse(params);
    if (!database.searchWhitelist(connectionParams?.check)) {
      connection.close();
      return;
    }
    webSocketServer.handleUpgrade(request, socket, head, (websocket) => {
      webSocketServer.emit("connection", websocket, request);
    });
  });

  webSocketServer.on(
    "connection",
    async function connection(webSocketConnection, connectionRequest) {
      // webSocketConnection.id = "kojovi"
      const [_path, params] = connectionRequest?.url?.split("?");
      const connectionParams = queryString.parse(params);
      const jwtContent = decoder(connectionParams?.check);
      if (jwtContent?.expired) {
        connection.close();
        return;
      }
      webSocketConnection.id = jwtContent?.email;
      const allUsers = await database.fetchAllUsers()
      const initialResponse = {currentUser:jwtContent?.email, Users:allUsers}
      webSocketConnection.send(JSON.stringify( initialResponse))
      webSocketConnection.on("message", (message) => {
        console.log(webSocketConnection.id,message);
        webSocketConnection.send(
          JSON.stringify({ message: "There be gold in them thar hills." })
        );
      });
    }
  );

  return webSocketServer;
};

// var express = require('express');
// var app = express();
// var jwt = require('express-jwt');
// var jwks = require('jwks-rsa');

// var port = process.env.PORT || 8080;

// var jwtCheck = jwt({
//       secret: jwks.expressJwtSecret({
//           cache: true,
//           rateLimit: true,
//           jwksRequestsPerMinute: 5,
//           jwksUri: 'https://dev-ae4gvrfj.us.auth0.com/.well-known/jwks.json'
//     }),
//     audience: 'http://localhost:5003',
//     issuer: 'https://dev-ae4gvrfj.us.auth0.com/',
//     algorithms: ['RS256']
// });

// app.use(jwtCheck);

// app.get('/authorized', function (req, res) {
//     res.send('Secured Resource');
// });

// app.listen(port);
