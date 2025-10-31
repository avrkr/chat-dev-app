import { transporter, senderEmail } from "../lib/nodemailer.js";
import {createWelcomeEmailTemplate} from "./emailTemplates.js";

export const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: senderEmail,
    to,
    subject: "Welcome to Our App!",
    html: createWelcomeEmailTemplate(name),
  };

  await transporter.sendMail(mailOptions);
};
