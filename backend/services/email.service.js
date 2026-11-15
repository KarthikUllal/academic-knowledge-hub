
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send an email using Resend
const sendEmail = async (to, subject, html) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: subject,
        html: html,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

module.exports = sendEmail;
