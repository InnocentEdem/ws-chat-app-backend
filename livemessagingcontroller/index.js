const userServices = require("../Services")
const { auth } = require('express-oauth2-jwt-bearer');
const sendNewMessage = require("./sendNewMessage")
const fetchAllUserChats = require("./fetchAllUserChats")
const fetchOneChat = require("./fetchOneChat")
const fetchUserBlockList = require("./fetchUserBlockList")
const blockUser = require("./blockUser")
const unblockUser = require("./unblockUser")
const fetchAllUsersBlockedByUser = require("./fetchAllUsersBlockedByUser")

 module.exports = async ({payload,action}) =>{

  switch(action){
    case "send_new_message":   return sendNewMessage(payload)
    case "fetch_one_chat" :  return fetchOneChat(payload);
    case "fetch_all_user_messages" : return fetchAllUserChats(payload)
    case "fetch_user_block_list" : return fetchUserBlockList(payload)
    case "block_user" : return blockUser(payload)
    case "unblock_user" : return unblockUser(payload)
    case "fetch_all_users_blocked" : return fetchAllUsersBlockedByUser(payload)
  }

}

