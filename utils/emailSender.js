// dependencies
const nodemailer = require('nodemailer');

// dot env and configuration dependencies
require('dotenv').config();
const config = require('config');

/**
 * Send Email
 *
 * @param {String} email email of client
 * @param {String} token verification token for the client
 * @returns {Boolean} true if email sent successfully else false
 */
module.exports = (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.get('email-address'),
            pass: config.get('email-password'),
        },
    });
    const mailOption = {
        to: email,
        from: config.get('email-address'),
        subject: 'Verification token for email',
        text: 'Token is: ' + token,
    };
    transporter.sendMail(mailOption, function (error, data) {
        if (error) {
            console.log('Could Not Sent the Email');
        }
    });
};
