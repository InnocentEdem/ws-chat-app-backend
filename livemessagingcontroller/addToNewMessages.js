const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({sent_by,sent_to,msg_text})=>{
     console.log(sent_by, sent_to, msg_text,"********************************************");

    const result=  await database.saveToNewMessage(sent_by,sent_to,msg_text)
    console.log(result,"rrrrrrrrreeeeeeeeeeeeeeeeeeeeeeeeeessssssssssssssssuuuuuuuuuuuuuuullllllllllllllllllllttttttttttttttttttttt");
}