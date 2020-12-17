require('dotenv').config(); //
const nodemailer = require('nodemailer');


module.exports = () => {

    const sendEmail = (mess, email) => {
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
            text: `The booking was successfully ${mess}. `
        };
        
        transporter.sendMail(mailOptions, function (err, info) {

            if (err) {
                console.log('Error: ', err);
                return;
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