import nodemailer from "nodemailer";
import config from "../config";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: config.email.user,
      pass: config.email.pass, 
    },
  });

  const mailOptions = {
    from: "MediMart",
    to: options.to,
    subject: options.subject,
    html: `<p>${options.html}</p>`,
  };

  await transporter.sendMail(mailOptions);
};
