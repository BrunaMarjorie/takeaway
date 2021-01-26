const { ObjectID } = require('mongodb');
const mail = require('../src/mail')();
const takeaway = require('../model/takeawayModel')();
const validations = require('../src/validations')();
const waitingTime = '15 minutes'; //set waiting time;


module.exports = () => {

    const getController = async (req, res) => {
        //check user logged in;
        const user = {status: 'staff'};
        //check if objectID is informed;
        const objectID = req.params.objectID;
        //check user status;
        //const validateUser = await validations.userValidation(user);
        //call takeawayModel function;
        const takeawayList = await takeaway.get(user, objectID);
        if (!takeawayList) {
            //return if no takeaway is found;
            return res.status(404).json({
                error: 404,
                message: 'No takeaway found',
            });

        } else {
            //return general list of takeaway;
            return res.json({ takeawayList });
        }
    };

    const postController = async (req, res) => {
        //check user logged in;
        //const userID = req.user;
        //collect order information;
        const { user, name, phoneNumber, date, order, comment, status, time, paid } = req.body;
        //check user status;
        const validateUser = await validations.userValidation(user);
        const orderType = validateUser['status'];

        try {
            if (orderType === 'admin' || orderType === 'staff') {
                //call takeawayModel function;
                const { results, error } = await takeaway.addByStaff(user, name, phoneNumber, date, order, comment, status, time, paid);

                if (error) {
                    //return if any error is found;
                    console.log(error);
                    res.status(400).send({ error });
                } else {
                    //return if succesfull;
                    return res.send(`Takeaway ordered successfully. Waiting time: ${time}. Total: € `);
                }


            } else {
                //call takeawayModel function;
                const { results, error } = await takeaway.addByCostumer(user, date, order, comment, status, time, paid);

                if (error) {
                    //return if any error is found;
                    console.log(error);
                    res.status(400).send({ error });
                } else {
                    //send notification;
                    const message = `Takeaway ordered successfully. Waiting time: ${time}. `;
                    //mail.sendEmail(message, results);
                    //return if succesfull;
                    return res.send(`Takeaway ordered successfully. Waiting time: ${time}. `);
                }
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception takeaway::add");
            return res.status(500).json({ error: ex });
        }
    };

    const deleteController = async (req, res) => {
        //check user logged in;
        const userID = req.user;
        let id = req.params.objectID;
        let objectID;
        try {
            if (new ObjectID(id).toHexString() === id) {
                objectID = id;
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception takeaway::delete/objectID");
            return res.send(`Error: ObjectID is not valid.`);
        }

        try {
            const results = await takeaway.deleteData(userID, objectID);
            //check result;
            if (results !== null && results !== -1) {
                //return if update is done by a staff;
                return res.end(`Takeaway deleted successfully`);
            } else if (results === -1) {
                //return if client try to delete a takeaway;
                return res.end(`Error: please contact the restaurant to cancel the takeaway.`);
            } else {
                //return if takeaway is not found;
                return res.end(`Error: takeaway not found.`);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception takeaway::delete");
            return res.status(500).json({ error: ex });
        }
    };

    const updateController = async (req, res) => {
        const userID = req.user;
        const id = req.params.objectID;
        let { order, comment, status, time, paid } = req.body;
        let objectID;
        let data = {};
        //check if the ObjectID passed is valid;
        try {
            if (new ObjectID(id).toHexString() === id) {
                //if valid, assign to the objectID variable;
                objectID = id;
            }
        } catch (ex) {
            //return if objectID is not valid;
            return res.send(`Error: ObjectID is not valid.`);
        }
        if (!order && !comment && !status && !time && !paid) {
            //return if no valid information is passed;
            return res.send(`Error: inform item to be updated.`);
        } else {
            if (order) { //routine if order is passed;
                const newOrder = await validations.orderValidation(order, userID);
                if (newOrder !== null && newOrder !== -1) {
                    data['orders'] = newOrder.order;
                } else if (newOrder === -1) {
                    return res.end(`Error: dish and/or quantity is missing.`);
                } else {
                    return res.end(`Error: please contact the restaurant to update takeaway.`);
                }
            }
            if (comment) {
                data['comment'] = comment;
            }
            if (time) {
                data['time'] = time;
            }
            if (status) {
                data['status'] = status;
            }
            if (paid) {
                data['paid'] = paid;
            }
            try {
                const results = await takeaway.updateData(objectID, data);
                //check result;
                if (results !== null) {
                    //return if takeaway is updated;
                    return res.end(`Takeaway updated successfully`);
                } else {
                    //return if takeaway is not found;
                    return res.end(`Error: takeaway not found.`);
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception takeaway::update");
                return res.status(500).json({ error: ex });
            }
        }
    };

    const searchController = async (req, res) => {
        //collect item to be researched;
        const search = req.body.search;
        //collect userID;
        const userID = req.user;
        try {
            //call takeaway Model function with search and userID;
            const searchOrder = await takeaway.search(search, userID);
            //check results
            if (searchOrder === null) {
                // return if takeaway does not have search
                return res.status(404).json({
                    error: 404,
                    message: 'No takeaway found',
                });
            } else {
                // return if search exists
                res.json(searchOrder);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception takeaway::search.");
            return res.status(500).json({ error: ex })
        }
    };


    const lastOrderController = async (req, res) => {
        userID = req.user;
        try {
            //call takeaway Model function with search;
            const searchOrder = await takeaway.lastOrder(userID);
            //check results
            if (searchOrder == null) {
                // return if takeaway does not have search
                return res.status(404).json({
                    error: 404,
                    message: 'No takeaway found',
                });
            } else {
                // return if search exists
                res.json(searchOrder);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception takeaway::search.");
            return res.status(500).json({ error: ex })
        }
    };


    return {
        getController,
        postController,
        deleteController,
        updateController,
        searchController,
        lastOrderController
    }
}