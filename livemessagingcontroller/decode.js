const jwt_decode = require("jwt-decode")
const moment = require("moment")



module.exports = (code) => {
  try {
    const decoded = jwt_decode(code);
    const toExpire = moment.unix(decoded?.exp);
    const email = decoded["https://localhost:3000/claims/email"];
    const timeNow = moment(Date.now());
    let expired = false;
    if (timeNow.diff(toExpire) >= 0) {
      expired = true;
    }
    return {expired,email}
  } catch (err) {
    console.log(err);
    return{expired:true,email:undefined}
  }
};