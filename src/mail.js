require('dotenv').config(); //
const nodemailer = require('nodemailer');


module.exports = () => {

    const sendEmail = (message, email, link) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            },
        });

        const mailOptions = {
            from: 'webdevcct@gmail.com',
            to: email,
            subject: 'Takeaway',
            text: `${message}.`,
            html: '<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>',
            amp: `<!doctype html>
            <html ⚡4email>
              <head>
                <meta charset="utf-8">
                <style amp4email-boilerplate>body{visibility:hidden}</style>
                <script async src="https://cdn.ampproject.org/v0.js"></script>
                <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
              </head>
              <body>
                <p> Please access the link below to reset your password. </p>
                <a href=${link}> Reset password </a>
                <p> 
              </body>
            </html>`
        };
        
        transporter.sendMail(mailOptions, function (err, info) {

            if (err) {
                console.log('Error: ', err);
                return null;
            } else {
                console.log('Mail sent' + info);
            }

            mailOptions.transport.close();
        });
    };

    return {
        sendEmail,
    }
}