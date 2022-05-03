const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({user_blocked})=>{
    const result = await database.fetchBlockListforUser(user_blocked);
    return result
}
