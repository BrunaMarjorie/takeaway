const { sign, verify } = require('jsonwebtoken');
const db = require('./database')();
const COLLECTION = 'users';
const bcrypt = require('bcrypt');

module.exports = () => {
    const userAuthentication = async (email, password) => {
        console.log('   inside users password');
        let user;
        try {
            //look up and match user key;        
            const users = await db.get(COLLECTION);
            for (i in users) {
                if ((email === users[i].email)) {
                    if (bcrypt.compareSync(password, users[i].password)) {
                        user = users[i];      
                    }
                }
            }
            if (user) {
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
        const { email, password } = req.headers;
        const clientIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        const FailedAuthMessage = {
            error: "Failed Authentication.",
        };

        if (!password && !email) {
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
                return res.status(401).json(FailedAuthMessage);
            }

            token = sign({user: user}, process.env.TOKEN, {
                expiresIn: '1d',
            });
        }
        return res.send ({ user, token });
    }

    const isAuthenticated = async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json('No user logged in.');
        }

        let [, token] = authHeader.split(' ');

        try {
            const decoded = verify(token, process.env.TOKEN);
            req.user = decoded.user;           
            return next();

        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception session::isAuthenticated.");
            return res.status(500).json({ error: ex });
        }
    }

    const logoutController = async (req, res) => {
        req.user = null;
        return res.redirect('/');
    }

    return {
        loginController,
        logoutController,
        isAuthenticated
    }
}