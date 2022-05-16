const dbservice = require("../Services")

const database = new dbservice

module.exports = async ({sent_to})=>{
    const result = await database.fetchFromNewMessages(sent_to);
    console.log(result,"kkkkkkkkkkkkkkkkkkkggggggggggggggggggggggggggggggg");
    return result
}
