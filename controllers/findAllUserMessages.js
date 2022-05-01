const {User,Groups,Message} = require("../models")
const dbService = require("../Services")

const database = new dbService;

const findAllMessagesForUser = async(email)=>{
    // const allUsers = await User.findAll(
    //         {where:{
    //             email:{
    //                 [Op.not]:email
    //             }}})

    return await Message.findAll({
        where:{
             sent_by:{email},
             sent_to:{email}
            }
    })

}