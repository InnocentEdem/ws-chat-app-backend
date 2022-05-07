const dbservice = require("../Services")

const database = new dbservice

module.exports = async (user_email)=>{

    const result = await database.fetchAllUserMessages(user_email)
    return result

}
