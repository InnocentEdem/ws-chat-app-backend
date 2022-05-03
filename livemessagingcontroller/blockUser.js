const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({user_blocked,blocked_by})=>{
    const result = await database.updateUserBlockList(user_blocked,blocked_by);
    return result
}
