const { User, WhiteList, Group, Message,Block } = require("./models")
const { Op } = require("sequelize");

class UserServices {
  async createNewUser(email) {
    try {
      return await User.findOrCreate({
        where: { email },
      });
    } catch (err) {}
  }

  async fetchAllUsers() {
    try {
      return await User.findAll();
    } catch (err) {}
  }
  async fetchUserToUserMessages(user2email,user1email) {
    try {
      const result = await Message.findAll({
        where: {
          [Op.or]: [
            {
              sent_by:user1email,
              sent_to:user2email
            },
            {
              sent_by: user2email,
              sent_to: user1email,
            },
          ],
        },
      });
      return result
    } catch (err) {console.log(err)}
  }
  async fetchAllUserMessages(email) {
    try {
      const result =  await Message.findAll({
        where: { [Op.or]: [{ sent_by: email }, { sent_to: email }] },
      });
      return result
    } catch (err) {}
  }
  async updateMessages( sent_by, sent_to, msg_text ) {
    try {
      const result = await Message.create({
       
        msg_text,
        sent_by,
        sent_to,
      });
      return result
    } catch (err) {}
  }
  async updateUserBlockList( user_blocked, blocked_by ) {
    try {
      const result = await Block.create({
       
        user_blocked,
        blocked_by
      });
      return result
    } catch (err) {}
  }
  async removeBlock( user_blocked, blocked_by ) {
    try {
            const result = await Block.destroy({
                where:{
                    user_blocked,
                    blocked_by} 
                });
                return result;
       
        }
     catch (err) {}
  }
  async fetchBlockListforUser(user_blocked) {
    try {
      const result = await Block.findAll({
       where:{
        user_blocked,
       }
             });
      return result
    } catch (err) {}
  }
  async fetchUsersBlockedByUser(blocked_by) {
    try {
      const result = await Block.findAll({
       where:{
        blocked_by,
       }
             });
      return result
    } catch (err) {}
  }
  async searchUser(email) {
    try {
      return await User.findOne({
        where: { email },
      });
    } catch (err) {}
  }
  async addToWhitelist(token) {
    try {
     const result = await WhiteList.findOrCreate({
        where:{ token} 
      });
      return result
    } catch (err) {
      console.log(err);
    }
  }
  async removeFromWhiteList(token) {
    try {
      return WhiteList.destroy({
          where:{ token} 
        });
    } catch (err) {
      console.log(err);
    }
  }
  async searchWhitelist(token) {
    try {
       const confirm = await WhiteList.findAll({
        where: { token },
      });
      return confirm
    } catch (err) {}
  }
  // async addUserToGroup(user){
  //     try{
  //         return await Group.
  //     }catch(err){

  //     }

  // }
  // async findUserFriends(){

  // }
  // async checkIfUserOnline(){

  // }
  // async saveUserMessage(){

  // }
  // async saveGroupMessage(){

  // }
  // async deleteUserMessage(){

  // }

  // async updateUserStatus(){

  // }
  // async fetchGroupMessages(){

  // }
  // async deleteGroupMessage(){

  // }
  // async blockUserFromUser(){

  // }
  // async blockUserFromGroup(){

  // }
}
module.exports = UserServices