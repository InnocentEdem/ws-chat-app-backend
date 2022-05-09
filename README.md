# Title
 Live Chat Application Backend using Web Socket Server
 
## Description
The Backend application for the live chat app is built with Node,express, and the ws package.
The postgres database is hosted on ElephantSQL.
The server manages the live connection with several clients, writing to the Database as a single source of truth, transmitting messages from one user 
to only that user, sending pings to keep the connection alive, broadcasting messages to all users, and closing connections.
Authentication is handled using Auth0 authentication service, but authorization is handled from within the application.
The request headers on the connection request from the client are quite limited. cookies and authentication tokens are not easily embeded. 
Some client agents do not support embedding additional headers. This presents unique challenges during the authorization phase of the connection.

### Authorization
A popular solution is to connect the client without verification. The authentication tokens are then sent as the first message from the client after a successful
connection. This is not particularly ideal,since the unverified client can listen to broadcasts, plus, Websocket connections put constraints on the server because connections have to be maintained. There is a limit on the number of clients a server could manage concurrently.
The authorization flow implemented in this project is different.
Two routes are implemented, one is built on an express server, and the other a websocket server.
During login, the client is directed to Auth0 to be authenticated. The client is issued jwt tokens after successful authentication. On redirection from Auth0, the client is connected to the express http authorization route where the jwt token is verified with Auth0 using the Aith0 authentication middleware.
On verification, the token is whitelisted and saved into the database. The user details are also saved.

The client is redirected to the websocket route in the browser after successful authorization to begin the ws connection upgrade.
On the ws route the token is sent as a parameter. The second verification process begins with decoding of the JWT and checking for expiration, and continues by checking it against the whitelisted tokens in the database.
On failure, the connection upgrade process is aborted. on Sucess, the token is immediately deleted from the database to prevent reuse.

### Maintaining the connection
A keep-alive signal is sent by the server to clents regularly.


## How to Install and run the Project

Run npm install and node app.js, or nodemon app.js. The JWTChecker should be reconfigured with credential from Auth0. There is a free tier available on first signup.

