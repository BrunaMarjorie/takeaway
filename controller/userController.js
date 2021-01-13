const { ObjectID } = require('mongodb');
const users = require('../model/usersModel')();
const bcrypt = require('bcrypt');
const validations = require('../src/validations')();
const mail = require('../src/mail')();


module.exports = () => {

    const getController = async (req, res) => {
        //check user logged in;
        const user = req.user;
        //check if objectID is informed;
        const objectID = req.params.objectID;
        //check user status;
        const validateUser = await validations.userValidation(user);
        //pass the userID information to userModels;
        const usersList = await users.get(validateUser, objectID);
        if (!usersList) {
            //return if no user found;
            return res.status(404).json({
                error: 404,
                message: 'No user found',
            });
        } else {
            //return general list of users;
            return res.json({ usersList });
        }
    }

    const postController = async (req, res) => {
        //collect information;
        const { name, email, status, password, confPassword } = req.body;
        try {
            const { results, error } = await users.add(name, email, status, password, confPassword);
            if (error) {
                console.log(error);
                res.status(400).send({error})
            } else {
                //send notification;
                const message = 'Welcome to Takeaway Restaurant!'
                //mail.sendEmail(message, email);
                res.send(`POST: ${name}, ${email}`);
            }          
        } catch (ex) {
            console.log("=== Exception user::add");
            return res.status(500).json({ error: ex })
        }
    }


    const deleteController = async (req, res) => {
        //check user logged in;
        const user = req.user;
        //check user status;
        const validateUser = await validations.userValidation(user);
        let id;
        let objectID;

        if (validateUser['status'] === 'admin') { //routine if user is an admin;
            id = req.params.objectID; //inform id to be deleted;
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

        } else {
            //if user is not an admin, they can only delete their own account;
            objectID = user;
        }
        try {
            const results = await users.deleteData(objectID);
            //check result;
            if (results != null) {
                console.log(results);
                //send notification;
                //const message = 'User deleted successfully!'
                //mail.sendEmail(message, results);
                //return success;
                return res.end(`User deleted successfully.`);
            } else {
                //return if user is not in the system;
                return res.end(`Error: User not found.`);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception users::delete");
            return res.status(500).json({ error: ex });
        }
    };

    const updateController = async (req, res) => {
        //check user logged in;
        const userID = req.user;
        //collect information to be updated;
        const { name, phoneNumber, password, address } = req.body;
        let data = {}; //array of items to be updated;

        if (!name && !phoneNumber && !password && !address) {
            //return if no valid information is passed;
            return res.send(`Error: inform item to be updated.`);
        } else {
            if (name) {
                //assign values to data to be updated;
                data['name'] = name;
            }
            if (phoneNumber) { //routine if phoneNumber passed;
                const phoneValid = phoneNumber.replace(/[^0-9]/g, '');
                //validate phone number format;
                if (phoneValid.length != 10) {
                    //return if phone number format is not valid;
                    return res.send(`Error: phone number format not valid.`);
                } else {
                    //assign values to data to be updated;
                    data['phoneNumber'] = phoneNumber;
                }
            }
            if (password) {
                //hash password;
                const hash = bcrypt.hashSync(password, 10);
                //assign values to data to be updated;
                data['password'] = hash;
            }
            if (address) {
                //validate address;
                const validAddress = await validations.addressValidation(address);
                if (!validAddress['lat'] || !validAddress['long']) {
                    //error if address is not valid;
                    return res.send('Error: Address is not valid.');
                } else {
                    //assign values to data to be updated;
                    data['address'] = address;
                }
            }
            try {
                const results = await users.updateData(userID, data);
                //check result;
                if (results != null && results != -1 && results != 0) {
                    //send notification;
                    //mail.sendEmail('updated', results);
                    //return if date is available;
                    return res.end(`User profile updated successfully`);
                } else {
                    //return if user is not in the database;
                    return res.end(`Error: user not found.`);
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception users controll::update");
                return res.status(500).json({ error: ex });
            }
        }
    };

    const searchController = async (req, res) => {
        const search = req.body.search;
        console.log(search);
        try {
            //call user Model function with search;
            const searchUser = await users.search(search);
            //check results
            if (searchUser == null) {
                // return if menu does not have search
                return res.status(404).json({
                    error: 404,
                    message: 'No user found',
                });
            } else {
                // return if search exists
                res.json(searchUser);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception user::search.");
            return res.status(500).json({ error: ex })
        }
    };

    return {
        getController,
        postController,
        deleteController,
        updateController,
        searchController
    }
}