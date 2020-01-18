require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: 'Welcome to the App!',
        text: `Welcome to the app, ${name}. Let me know how it works for you!`
    });
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: 'Sorry to see you go!',
        text: 'If you\'d like to let us know why you\' leaving, it will help us improve our service in the future.'
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}