const { ObjectID } = require('mongodb');
const users = require('../model/usersModel')();
const bcrypt = require('bcrypt');
const Nominatim = require('nominatim-geocoder');
const geocoder = new Nominatim();


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
        const { firstName, lastName, email, address, phoneNumber, password } = req.body;
        let usertype = req.body.usertype;
        if (!firstName || !lastName) {
            return res.send(`Error: Name is missing.`);
        }
        if (!email) {
            return res.send(`Error: Email is missing.`);
        } else {
            //validate email format;
            const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!mailformat.test(String(email).toLowerCase())) {
                return res.send(`Error: Email format is not valid.`);
            }
        }
        if (address) {
            let lat;
            let long;
            const results = await geocoder.search({ q: address })
                .then((response) => {
                    if (response.length === 1) {
                        lat = response[0].lat;
                        long = response[0].lon;
                    } else {
                        lat = null;
                        long = null;
                    }
                })
                .catch((error) => {
                    console.log(error);
                });

            if (!lat && !long) {
                return res.send('Error: Address is not valid.');
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
            return res.send(`Usertype is not valid. It must be 'admin' or 'user'.`);
        }
        if (!password) {
            return res.send(`Error: Password is missing.`);
        }
        //method starts only after all the items are passed;
        if (firstName && lastName && email && phoneNumber && usertype && password) {
            const hash = bcrypt.hashSync(password, 10);
            try {
                const results = await users.add(firstName, lastName, email, address, phoneNumber, usertype, hash);
                //check if email is unique;
                if (results != null) {
                    return res.end(`POST: ${firstName} ${lastName}, ${email}, ${usertype}`);
                } else {
                    return res.end(`Error: ${email} already exists in our system.`);
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

    const updateController = async (req, res) => {
        const id = req.params.objectID;
        let { name, phoneNumber, password, address } = req.body;
        let objectID;
        let data = {};
        try {
            //check if the ObjectID passed is valid;
            if (new ObjectID(id).toHexString() === id) {
                //if valid, assign to the objectID variable;
                objectID = id;
            }
        } catch (ex) {
            //return if objectID is not valid;
            return res.send(`Error: ObjectID is not valid.`);
        }
        if (!name && !phoneNumber && !password && !address) {
            //return if no valid information is passed;
            return res.send(`Error: inform item to be updated.`);
        } else {
            if (name) {
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
                let lat;
                let long;
                const results = await geocoder.search({ q: address })
                    .then((response) => {
                        if (response.length === 1) {
                            lat = response[0].lat;
                            long = response[0].lon;
                        } else {
                            lat = null;
                            long = null;
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                if (!lat && !long) {
                    return res.send('Error: Address is not valid.');
                } else {
                    data['address'] = address;
                }

            }
            try {
                const results = await users.updateData(objectID, data);
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
                console.log("=== Exception bookings::update");
                return res.status(500).json({ error: ex });
            }
        }
    };


    return {
        getController,
        getByEmail,
        postController,
        deleteController,
        updateController,
    }
}