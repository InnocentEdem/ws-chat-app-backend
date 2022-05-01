const userServices = require("../Services")
const { auth } = require('express-oauth2-jwt-bearer');


const dbservice = new userServices

const fetchMessages = (data) =>{
    // const {email} = data

    console.log(dbservice.createNewUser("kwasi"))
    // return userServices.fetchMessages(data)


}
const checkJwt = auth({
    audience: 'undefined',
    issuerBaseURL: `https://dev-ae4gvrfj.us.auth0.com/`,
  });


module.exports = fetchMessages