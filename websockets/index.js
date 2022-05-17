const webSocket = require("ws");
const queryString = require("query-string");
const decoder = require("../livemessagingcontroller/decode");
const dbservice = require("../Services");
const handleResponse = require("../livemessagingcontroller");
module.exports = (server) => {
  const database = new dbservice();
  const usersOnline = {};
  let parties = [];
  const setIntervals = {}
  const waitingList = []
  const pingTracker ={}
  const pongTracker ={}


  const webSocketServer = new webSocket.Server({
    noServer: true,
    path: "/websockets",
  });

  const broadcastMessage = (data) => {
    Object.keys(usersOnline)?.map((client) => {
      try {
        if (usersOnline?.[client]) {
          usersOnline?.[client]?.send(JSON.stringify(data));
        }
      } catch (err) {}
    });
  };
  const sendToOne=(emailId,data)=>{
    for(const key in usersOnline){
      if(key === emailId){
        try{
          usersOnline?.[key]?.send(JSON.stringify(data))
        }catch(err){
          console.log(err);
        }
      }
    }
  }

  const KeepAlive = (clientEmail) => {
    try {
      const data = { category: "keep_alive" }
      pingTracker[clientEmail] = 0
      pongTracker[clientEmail] = 0

      setIntervals[clientEmail] = setInterval(() => {
        sendToOne(clientEmail, data)
        pingTracker[clientEmail] += 1

        if(pingTracker[clientEmail]===10){
          pingTracker[clientEmail]=0;
          console.log(`ping ------------------>${clientEmail}`);
        }
        waitingList.push(clientEmail)
        setTimeout(() => {
          if (waitingList.includes(clientEmail)) {
            clearInterval(setIntervals[clientEmail])
            delete pingTracker[clientEmail];
            delete pongTracker[clientEmail];
            console.log(`${clientEmail} connection inactive`)
          }
        }, 1500)
      }, 3000)
    } catch (err) {
      console.log(err);
    }
  }


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

      const [_path, params] = connectionRequest?.url?.split("?");
      const connectionParams = queryString.parse(params);
      const jwtContent = decoder(connectionParams?.check);
      if (jwtContent?.expired) {
        return;
      }
      await database.removeFromWhiteList(
        connectionParams?.check
      );
      KeepAlive(jwtContent?.email);
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
      const allUsers = await handleResponse({
        payload:{user:jwtContent?.email},
        action: "fetch_all_users"
      })
      let newUserMessagesOnLogin = await handleResponse({
        payload:{sent_to:jwtContent?.email},
        action: "fetch_new_messages"
      })

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
      let allUsersUpdate = {
        allUsers,
        category:"fetch_all_users"
      }
      let newMessagesOnLogin = {
        newUserMessagesOnLogin,
        category:"fetch_new_messages"
      }
      //send initial message
      webSocketConnection.send(JSON.stringify(blockListResult));
      webSocketConnection.send(JSON.stringify(blockListForBlockerResult));
      webSocketConnection.send(JSON.stringify(allMessagesResult));
      webSocketConnection.send(JSON.stringify(userUpdate));
      webSocketConnection.send(JSON.stringify(allUsersUpdate));
      webSocketConnection.send(JSON.stringify(newMessagesOnLogin));
      broadcastMessage(userUpdate); 

      webSocketConnection.on("message", async (message) => {
        //message handler using livemessage controller
        const newMessage = JSON.parse(message);

        const response = await handleResponse({payload: newMessage.payload, action: newMessage.action});

        if (newMessage?.action === "send_new_message") {
            parties = [ newMessage?.payload.sent_by,newMessage?.payload.sent_to,];
              sendToOne(parties?.[1], {sent_by:parties[0],category:"new_message"})
              sendToOne(parties?.[0], {sent_to:parties[1],category:"sent_success"})
              handleResponse({payload:newMessage.payload,action:"add_to_new_messages"})
        }
        //pingpong implementation

        if(newMessage?.action==="fetch_one_chat"){
          parties = [ newMessage?.payload.sent_by,newMessage?.payload.sent_to,] 
          sendToOne(parties[0], {category:"message",subject:newMessage.sent_to,content:response})         
        }
        if(newMessage?.action==="remove_from_new_messages"){
          parties = [ newMessage?.payload.sent_by,newMessage?.payload.sent_to,] 
          newUserMessagesOnLogin = await handleResponse({
            payload:{sent_to:parties[0]},
            action: "fetch_new_messages"
          })
          sendToOne(parties[1], {newUserMessagesOnLogin, category:"fetch_new_messages" })         
        }
        if(newMessage?.action==="keep_alive"){
          try{
           const id = newMessage?.payload
           pongTracker[id] +=1
           if(pongTracker[id] > 10){
            console.log(id,`replied ---------------->"pong"`);
            pongTracker[id] = 0
          }
            waitingList.splice(waitingList.indexOf(newMessage.user),1)
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
            sendToOne(parties[0],newBlockListResult)
            sendToOne(parties[1],newBlockListForBlockerResult)
            userUpdate = {usersOnline: Object?.getOwnPropertyNames(usersOnline),category: "users_update"};
            broadcastMessage(userUpdate);
          }catch(err){
           console.log(err);
          }
        }
      });

      webSocketConnection.on("close", async function (_connection) {
        delete usersOnline[jwtContent?.email];
        userUpdate = {
          usersOnline: Object?.getOwnPropertyNames(usersOnline),
          category: "users_update",
        };
        try{
          broadcastMessage(userUpdate);
        }catch(err){
         console.log(err);
        }
        
      });
    }
  );

  return webSocketServer;
};
