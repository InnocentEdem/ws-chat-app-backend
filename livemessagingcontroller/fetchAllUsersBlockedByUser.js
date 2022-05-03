const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({blocked_by})=>{
    const result = await database.fetchUsersBlockedByUser(blocked_by);
    return result
}