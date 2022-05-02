const { User, WhiteList, Group, Message } = require("./models")

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
  async findUsertoUserMessages(user1email, user2email) {
    try {
      return await Message.findAll({
        where: {
          [Op.or]: [
            {
              sent_by: { user1email },
              sent_to: { user2email },
            },
            {
              sent_by: { user2email },
              sent_to: { user1email },
            },
          ],
        },
      });
    } catch (err) {}
  }
  async fetchAllUserMessages(email) {
    try {
      return await Message.findAll({
        where: { [Op.or]: [{ sent_by: email }, { sent_to: email }] },
      });
    } catch (err) {}
  }
  async updateMessages({ sent_by, sent_to, msg_txt }) {
    try {
      return await Message.create({
        sent_by,
        sent_to,
        msg_txt,
      });
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
      return await WhiteList.create({ token });
    } catch (err) {
      console.log(err);
    }
  }
  async searchWhitelist(token) {
    try {
      return await WhiteList.findOne({
        where: { token },
      });
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