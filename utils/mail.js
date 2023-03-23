const nodemailer = require('nodemailer');
exports.generateOTP = (otp_length=6) => {

  let OTP = "";
  for (let i = 0; i < otp_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  return OTP;
};

exports.generateMailTransporter=()=>{
    nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "217ec9170031ca",
          pass: "c55f68b6f99edb",
        },
      });
}