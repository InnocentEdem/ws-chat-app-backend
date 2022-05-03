const dbservice = require("../Services")

const database = new dbservice

module.exports = async({sent_by,sent_to,msg_text})=>{

     const result = await  database.updateMessages(sent_by,sent_to, msg_text)
     const result2 = await database.fetchUserToUserMessages(sent_by,sent_to)
     return result2
     
}

