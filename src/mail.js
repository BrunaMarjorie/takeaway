require('dotenv').config(); //
const nodemailer = require('nodemailer');
const db = require('./database')();

module.exports = () => {

    const sendEmail = (list) => {
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

        const mailList = list;

        mailList.forEach(function (to, i, array) {

            const mailOptions = {
                from: 'webdevcct@gmail.com',
                subject: 'Bug_Tracker_CBWA',
                text: 'The issue you have been watching was updated. '
            };
            mailOptions.to = to;

            transporter.sendMail(mailOptions, function (err, data) {

                if (err) {
                    console.log('Error', err);
                    return;
                } else {
                    console.log('Mail sent');
                }

                if (i === mailList.length - 1) {
                    mailOptions.transport.close();
                };
            });
        });
    };

    const update = async (issueNumber) => {
        let list =[];
        try {
            list = await db.usersWatchers({ issueNumber });
            console.log(list);
            sendEmail(list);
        } catch (ex) {
            console.log("=== Exception usersEmail::usersWatchers{issueNumber}");
            return { error: ex };
        };
    };

    const dateUpdate = async () => {
        try{
            const issues = await db.checkDueDate();
            if(issues.length > 0){
                issues.forEach(element => {
                    let issueNumber = element;
                    update(issueNumber); 
                });
            }; 
        } catch (ex) {
            console.log("=== Exception dateUpdate::checkDueDate");
            return { error: ex };
        };
    };

    return {
        sendEmail,
        update,
        dateUpdate,
    }
}