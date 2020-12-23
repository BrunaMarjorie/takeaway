const { ObjectID } = require('mongodb');
const delivery = require('../model/deliveryModel')();
const validations = require('../validations')();
const { body } = require('express-validator');


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
        let total = Number();
        //collect order information;
        let { userID, order, comment, status, time, paid } = req.body;
        //validate entries;
        if (!userID) {
            return res.send(`Error: user is missing.`); //return if no userID is informed;
        }
        if (!order) {
            return res.send(`Error: order is missing.`); //return if no order is informed;
        } else {
            const valid = await validations.validateOrder(order);
            if (valid == -1) {
                //return if no order is not valid;
                return res.send(`Error: order must have pairs of dish and quantity.`);
            } else if (valid == null) {
                //return if objectID is not valid;
                return res.send(`Error: ObjectID is not valid.`);
            } else {
                //return order final price;
                total = valid;
            }
        }
        if (!comment) {
            comment = ['no comments']; //set comment default;
        }
        if (!status) {
            status = "open"; //set status default;
        }
        if (!time) {
            time = waitingTime; //set time default;
        }
        if (!paid) {
            paid = 'not paid'; //set paid default;
        }
        //method starts only after all the items are passed;
        if (userID && order) {
            try {
                //call takeawayModel function;
                const results = await takeaway.add(userID, order, comment, total, status, time, paid);
                //check result;
                if (results != null) {
                    //return if takeaway is ordered;
                    return res.end(`Takeaway ordered successfully. Waiting time: ${time} minutes. Total: € ${total}`);
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception takeaway::add");
                return res.status(500).json({ error: ex });
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
        deleteController,
    }
}