const {User,Groups,Message} = require("../models")
const dbService = require("../Services")

const database = new dbService;

const findAllMessagesForUser = async({payload,action})=>{

   if( action === "new_connection" ){
       return {users: database.fetchAllUsers(),currentUser:payload}
   }
   if(action === "fetch_one_chat"){
       return database.fetchUserToUserMessages(payload?.from,payload?.about)
   }
   if (action ==="send_new_message"){
       return database.updateMessages(...payload)
   }
 
   if (action ==="fetch_all_user_messages"){
       return database.fetchAllUserMessages(payload?.email)
   }
 

}
module.exports={
    findAllMessagesForUser
}