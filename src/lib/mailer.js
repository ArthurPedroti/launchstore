const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "a8138e2004ff4c",
    pass: "a4926de5d5e229",
  },
});
