const webSocket = require("ws");
const queryString = require("query-string");
const { auth } = require("express-oauth2-jwt-bearer");
const decoder = require("../livemessagingcontroller/decode");
const dbservice = require("../Services");
const handleResponse = require("../livemessagingcontroller");
module.exports = (server) => {
  const database = new dbservice();
  const usersOnline = {};
  let parties = [];

  const webSocketServer = new webSocket.Server({
    noServer: true,
    path: "/websockets",
  });

  const sendMessage = (data) => {
    Object.keys(usersOnline).map((client) => {
      usersOnline[client]?.send(JSON.stringify(data));
    });
  };

  server.on("upgrade", (request, socket, head) => {
    const [_path, params] = request?.url?.split("?");
    const connectionParams = queryString.parse(params);

    if (!database.searchWhitelist(connectionParams?.check)) {
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
        return;
      }
      await database.removeFromWhiteList(connectionParams.check);

      const blockListForBlocker = await handleResponse({
        payload: { blocked_by: jwtContent?.email },
        action: "fetch_all_users_blocked",
      });
      const blockList = await handleResponse({
        payload: { user_blocked: jwtContent?.email },
        action: "fetch_user_block_list",
      });
      webSocketConnection.id = jwtContent?.email;
      webSocketConnection.currentToken = connectionParams?.check;

      usersOnline[jwtContent?.email] = webSocketConnection;

      let blockListResult = {
        blockList,
        category: "block_list",
      };
      let blockListForBlockerResult = {
        blockListForBlocker,
        category: "block_list_for_blocker",
      };
      let userUpdate = {
        usersOnline: Object.getOwnPropertyNames(usersOnline),
        category: "users_update",
      };
      webSocketConnection.send(JSON.stringify(blockListResult));
      webSocketConnection.send(JSON.stringify(blockListForBlockerResult));
      sendMessage(userUpdate);

      webSocketConnection.send(JSON.stringify(userUpdate));

      webSocketConnection.on("message", async (message) => {
        const newMessage = JSON.parse(message);
        if (newMessage?.action === "send_new_message") {
          parties = [newMessage?.payload.sent_to, newMessage?.payload.sent_by];
        }
        if (
          newMessage?.action === "block_user" ||
          newMessage?.action === "unblock_user"
        ) {
          parties = [
            newMessage?.payload.user_blocked,
            newMessage?.payload.blocked_by,
          ];
        }

        const response = await handleResponse({
          payload: newMessage.payload,
          action: newMessage.action,
        });
        webSocketConnection.send(JSON.stringify(response));
        if (newMessage?.action === "send_new_message") {
          usersOnline[parties[0]].send(JSON.stringify(response));
        }
        if (
          newMessage?.action === "block_user" ||
          newMessage?.action === "unblock_user"
        ) {
          const newBlockList = await handleResponse({
            payload: { user_blocked: parties[0] },
            action: "fetch_user_block_list",
          });
          const newBlockListForBlocker = await handleResponse({
            payload: { blocked_by: parties[1] },
            action: "fetch_all_users_blocked",
          });
          let newBlockListResult = {
            blockList: newBlockList,
            category: "block_list",
          };
          let newBlockListForBlockerResult = {
            newBlockListForBlocker,
            category: "block_list_for_blocker",
          };
          usersOnline[parties[0]].send(JSON.stringify(newBlockListResult));
          usersOnline[parties[1]].send(
            JSON.stringify(newBlockListForBlockerResult)
          );
          userUpdate = {
            usersOnline: Object?.getOwnPropertyNames(usersOnline),
            category: "users_update",
          };
          sendMessage(userUpdate);
        }
      });

      webSocketConnection.on("close", async function (connection) {
        delete usersOnline[jwtContent.email];
        userUpdate = {
          usersOnline: Object?.getOwnPropertyNames(usersOnline),
          category: "users_update",
        };
        sendMessage(userUpdate);
      });
    }
  );

  return webSocketServer;
};
