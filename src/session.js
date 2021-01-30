const { sign, verify } = require('jsonwebtoken');
const db = require('./database')();
const COLLECTION = 'users';
const bcrypt = require('bcrypt');
const mail = require('./mail')();
const { ObjectID } = require('mongodb');


module.exports = () => {
    const userAuthentication = async (email, password) => {
        let userID;
        console.log('   inside users password');
        try {
            //look up and match user key;        
            const users = await db.get(COLLECTION);
            let user;
            for (i in users) {
                if ((email === users[i].email)) {
                    //check password;
                    if (bcrypt.compareSync(password, users[i].password)) {
                        userID = users[i]._id;
                        user = users[i];
                    }
                }
            }
            if (userID) {
                return user;
            } else {
                console.log(" Error: User not found.");
                return null;
            }

        } catch (ex) {
            console.log("=== Exception user::userAuthentication");
            return { error: ex };
        }
    }

    const loginController = async (req, res) => {
        let user;
        let token;
        const { email, password } = req.body;
        //const { email, password } = req.headers;
        const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        const FailedAuthMessage = {
            error: "Failed Authentication.",
        };

        if (!password || !email) {
            //return if no information is passed;
            console.log("   [%s] FAILED AUTHENTICATION -- %s, No email or password supplied",
                new Date(), clientIp);
            FailedAuthMessage.code = "01";
            FailedAuthMessage.message = "No email or password supplied";
            return res.status(401).json(FailedAuthMessage);
        } else {
            try {
                user = await userAuthentication(email, password);
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception session::login");
                return res.status(500).json({ error: ex });
            };
            if (!user) {
                console.log("   [%s] FAILED AUTHENTICATION -- %s, Incorrect email and/or password.",
                    new Date(), clientIp);
                FailedAuthMessage.code = "02";
                FailedAuthMessage.message = "Incorrect email and/or password";
                return res.status(401).json({ error: "Incorrect email and/or password" });
            }

            // assign a validation token to the user
            token = sign({ user: user }, process.env.TOKEN, {
                expiresIn: '7h', //token is going to be valid for 7h.
            });
            try {
                const filter = { '_id': ObjectID(user._id) };
                //set info to be updated;
                const updateDoc = { '$set': { 'token': token } };
                const result = await db.updateData(COLLECTION, filter, updateDoc);
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception session::update");
                return res.status(500).json({ error: ex });
            };
        }
        //return when successfull;
        console.log('logged');
        req.user = user._id;
        console.log(req.user);
        return res.send(user);
    }

    const isAuthenticated = async (req, res, next) => {
        //const username = req.headers.email;
        const {userID} = req.body;
        console.log(userID);

        if (!userID) {
            //return if no information provided;
            return res.status(401).json('No user logged in.');
        }
        try {
            //check user and token;
            const user = await db.get(COLLECTION, { '_id': ObjectID(userID) });
            const token = user[0].token;

            if (token) {
                try {
                    //check if token is valid;
                    const decoded = verify(token, process.env.TOKEN);
                    req.user = decoded.user;
                    console.log(req.user);
                    return next();

                } catch (ex) {
                    //return if any error occurs;
                    console.log("=== Exception session::isAuthenticated.");
                    return res.status(500).json('You must be logged in to access this page.');
                }
            } else {
                //return if token not valid.
                return res.status(401).json('You must be logged in to access this page.');
            }


        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception session::isAuthenticated.");
            return res.status(500).json({ error: ex });
        }
    }

    const logoutController = async (req, res) => {
        const username = req.headers.email;

        if (!username) {
            return res.status(401).json('No user logged in.');
        }
        try {
            //check user information;
            const user = await db.find(COLLECTION, { email: username });

            const filter = { '_id': ObjectID(user) };
            //set info to be updated;
            const updateDoc = { '$set': { 'token': null } };
            const result = await db.updateData(COLLECTION, filter, updateDoc);

        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception session::logout.");
            return res.status(500).json({ error: ex });
        }

        return res.redirect('/');
    }


    const forgotController = async (req, res) => {
        const { email } = req.body;

        try {

            const result = await db.get(COLLECTION, { email });
            
            if (result.length <= 0) {
                console.log('here');
                return res.send({ error: "User not found" });
            
            } else {
                //create link to be send;
                const link = `https://santanas-api.herokuapp.com/reset/password/${email}/reset/password`

                //message to be sent;
                const message = `Please access the link below to reset your password`;

                const notification = mail.sendEmail(message, email);

                if (notification !== null) {
                    return res.send("Email sent");
                } else {
                    return res.send({ error: "Some error has occurred. Please, try again." });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(400).send({ error });

        }


    }

    return {
        loginController,
        logoutController,
        isAuthenticated,
        forgotController
    }
}