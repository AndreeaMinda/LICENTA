const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "volatplan.adm@gmail.com",
    pass: "fxocdgmbwhzqhwrc", // parola de aplicație
  },
});

const mailOptions = {
  from: "volatplan.adm@gmail.com",
  to: "volatplan.adm@gmail.com",
  subject: "Test Nodemailer",
  text: "Test simplu din test-email.js",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error("❌ Eroare trimitere email:", error);
  }
  console.log("✅ Email trimis:", info.response);
});
