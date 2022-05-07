const webSocket = require("ws");
const queryString = require("query-string");
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
    Object.keys(usersOnline)?.map((client) => {
      try {
        if (usersOnline?.[client]) {
          usersOnline?.[client]?.send(JSON.stringify(data));
        }
      } catch (err) {}
    });
  };

  server.on("upgrade", async (request, socket, head) => {
    const [_path, params] = request?.url?.split("?");
    const connectionParams = queryString.parse(params);

    const dbCheck = await database.searchWhitelist(connectionParams?.check);

    if (!dbCheck) {
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
      //pre-admission handling
      const [_path, params] = connectionRequest?.url?.split("?");
      const connectionParams = queryString.parse(params);
      const jwtContent = decoder(connectionParams?.check);
      if (jwtContent?.expired) {
        return;
      }
      await database.removeFromWhiteList(
        connectionParams?.check
      );
      const blockListForBlocker = await handleResponse({
        payload: { blocked_by: jwtContent?.email },
        action: "fetch_all_users_blocked",
      });
      const blockList = await handleResponse({
        payload: { user_blocked: jwtContent?.email },
        action: "fetch_user_block_list",
      });

      const allMessages = await handleResponse({
        payload: { user_email: jwtContent?.email },
        action: "fetch_all_user_messages",
      });

      webSocketConnection.id = jwtContent?.email;
      webSocketConnection.currentToken = connectionParams?.check;

      usersOnline[jwtContent?.email] = webSocketConnection;
      //preparing initial responses
      let allMessagesResult = {
        allMessages,
        category: "all_messages",
      };
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
      //send initial message
      webSocketConnection.send(JSON.stringify(blockListResult));
      webSocketConnection.send(JSON.stringify(blockListForBlockerResult));
      webSocketConnection.send(JSON.stringify(allMessagesResult));
      sendMessage(userUpdate); 
      webSocketConnection.send(JSON.stringify(userUpdate));

      webSocketConnection.on("message", async (message) => {
        //message handler using livemessage controller
        const newMessage = JSON.parse(message);
        parties=[newMessage?.payload]

        const response = await handleResponse({payload: newMessage.payload, action: newMessage.action});

        if (newMessage?.action === "send_new_message") {
            parties = [ newMessage?.payload.sent_by,newMessage?.payload.sent_to,];
          try{
            if(usersOnline?.[parties?.[0]]){
              usersOnline?.[parties?.[0]].send(JSON.stringify({sent_to:parties[1],category:"new_message"}))
           }
           if(usersOnline?.[parties?.[1]]){
            usersOnline?.[parties?.[1]].send(JSON.stringify({sent_by:parties[0],category:"sent_success"}))
           }
          }catch(err){
            console.log(err);
          }
        }
        //pingpong implementation
        if (newMessage.action === "do_not_sleep") {
          userUpdate = { usersOnline: "Not needed",category: "do_not_sleep",};
          sendMessage(JSON.stringify(userUpdate));
        }

        if(newMessage?.action==="fetch_one_chat"){
          console.log(parties,parties[0]?.sent_by)
          try{
            usersOnline?.[parties[0]?.sent_by].send(JSON.stringify({category:"message",subject:newMessage.sent_to,content:response}))
          }catch(err){
            console.log(err);
          }
        }
        
        if (
          newMessage?.action === "block_user" || newMessage?.action === "unblock_user") {
            parties = [ newMessage?.payload.user_blocked, newMessage?.payload.blocked_by];
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

          try{
            let newBlockListForBlockerResult = {newBlockListForBlocker, category: "block_list_for_blocker"};
            usersOnline?.[parties[0]].send(JSON.stringify(newBlockListResult));
            usersOnline?.[parties[1]].send(JSON.stringify(newBlockListForBlockerResult));
            userUpdate = {usersOnline: Object?.getOwnPropertyNames(usersOnline),category: "users_update"};
            sendMessage(userUpdate);
          }catch(err){
           console.log(err);
          }
        }
      });

      webSocketConnection.on("close", async function (connection) {
        delete usersOnline[jwtContent?.email];
        userUpdate = {
          usersOnline: Object?.getOwnPropertyNames(usersOnline),
          category: "users_update",
        };
        try{
          sendMessage(userUpdate);
        }catch(err){
         console.log(err);
        }
        
      });
    }
  );

  return webSocketServer;
};
