const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({user})=>{
    const result = await database.fetchAllUsers(user)
    return result
}
