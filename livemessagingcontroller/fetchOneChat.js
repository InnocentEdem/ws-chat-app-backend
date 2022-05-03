const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({sent_by,sent_to})=>{
    const result = await database.fetchUserToUserMessages(sent_by,sent_to);
    return result
}
