const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({sent_to})=>{

    await database.removeFromNewMessages(sent_to)

}