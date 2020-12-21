const { ObjectID } = require('mongodb');
const users = require('../model/usersModel')();
const bcrypt = require('bcrypt');

module.exports = () => {

    const getController = async (req, res) => {
        const { usersList, error } = await users.get();
        if (error) {
            return res.status(500).json({ error })
        } else {
            res.json({ users: usersList });
        }
    }

    const getByEmail = async (req, res) => {
        try {
            const usersList = await users.get(req.params.email);
            //check if user exists;
            if (usersList == null) {
                res.status(404).json({
                    error: 404,
                    message: 'User not found',
                });
            } else {
                res.json(usersList);
            }
        } catch (ex) {
            console.log("=== Exception user::getByEmail.");
            return res.status(500).json({ error: ex })
        }
    }

    const postController = async (req, res) => {
        const {name, email, phoneNumber, password} = req.body;
        let usertype = req.body.usertype
        if (!name) {
            res.send(`Error: Name is missing.`);
        }
        if (!email) {
            res.send(`Error: Email is missing.`);
        } else {
            //validate email format;
            const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!mailformat.test(String(email).toLowerCase())) {
                res.send(`Error: Email format is not valid.`);
            }
        }
        if (!phoneNumber) {
            return res.send(`Error: phone number is missing.`); //return if no phone number is informed;
        } else {
            const phoneValid = phoneNumber.replace(/[^0-9]/g, '');
            //validate phone number format;
            if (phoneValid.length != 10) {
                //return if phone number format is not valid;
                return res.send(`Error: phone number format not valid.`);
            }
        }

        if (!usertype) {
            usertype = 'user';
            //validate usertype;
        } else if (usertype !== "admin" && usertype !== "user") {
            res.send(`Usertype is not valid. It must be 'admin' or 'user'.`);
        }
        if (!password) {
            res.send(`Error: Password is missing.`);
        }
        //method starts only after all the items are passed;
        if (name && email && phoneNumber && usertype && password) {
            const hash = bcrypt.hashSync(password, 10);
            console.log('  inside controller users');
            try {
                const results = await users.add(name, email, phoneNumber, usertype, hash);
                //check if email is unique;
                if (results != null) {
                    res.end(`POST: ${name}, ${email}, ${usertype}`);
                } else {
                    res.end(`Error: ${email} already exists in our system.`);
                }
            } catch (ex) {
                console.log("=== Exception user::add");
                return res.status(500).json({ error: ex })
            }
        }
    }


    const deleteController = async (req, res) => {
        const id = req.params.objectID;
        let objectID;
        try {
            //check if id collected is a valid ObjectID;
            if (new ObjectID(id).toHexString() === id) {
                objectID = id;
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception users::delete/objectID");
            return res.send(`Error: ObjectID is not valid.`);
        }
        try {
            const results = await users.deleteData(objectID);
            //check result;
            if (results != null && results != -1) {
                //return success;
                return res.end(`User deleted successfully`);
            } else {
                //return if user is not in the system;
                return res.end(`Error: User not found.`);
            }
        } catch (ex) {
            //return if any error occurs;s
            console.log("=== Exception users::delete");
            return res.status(500).json({ error: ex });
        }
    };


    return {
        getController,
        getByEmail,
        postController,
        deleteController
    }
}