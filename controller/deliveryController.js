const { ObjectID } = require('mongodb');
const mail = require('../src/mail')();
const delivery = require('../model/deliveryModel')();
const validations = require('../src/validations')();



module.exports = () => {

    const getController = async (req, res) => {
        //check user logged in;
        const user = { status: 'staff' };
        //check if objectID is informed;
        const objectID = req.params.objectID;
        //check user status;
        //const validateUser = await validations.userValidation(user);
        //call deliveryModel function;
        const deliveryList = await delivery.get(user, objectID);
        if (!deliveryList) {
            //return if no delivery is found;
            return res.status(404).json({
                error: 404,
                message: 'No delivery found',
            });

        } else {
            //return general list of delivery;
            return res.json({ deliveryList });
        }
    };

    const postController = async (req, res) => {
        //check user logged in;
        //const userID = req.user;
        //collect order information;
        const { user, name, phoneNumber, address, date, order, comment, status, time, paid } = req.body;
        //check user status;
        const validateUser = await validations.userValidation(user);
        const orderType = validateUser['status'];

        try {
            if (orderType === 'admin' || orderType === 'staff') {
                //call deliveryModel function;
                const { results, error } = await delivery.addByStaff(user, name, phoneNumber, address, date, order, comment, status, time, paid);

                if (error) {
                    //return if any error is found;
                    console.log(error);
                    res.status(400).send({ error });
                } else {
                    //return if succesfull;
                    return res.send(`Delivery ordered successfully. Waiting time: ${time}. Total: € `);
                }

            } else {
                //call deliveryModel function;
                const { results, error } = await delivery.addByCustomer(user, address, date, order, comment, status, time, paid);

                if (error) {
                    //return if any error is found;
                    console.log(error);
                    res.status(400).send({ error });
                } else {
                    //send notification;
                    const message = `Delivery ordered successfully. Waiting time: ${time}. `;
                    mail.sendEmail(message, results);
                    //return if succesfull;
                    return res.send(`Delivery ordered successfully. Waiting time: ${time}. `);
                }
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception delivery::add");
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
            console.log("=== Exception delivery::delete/objectID");
            return res.send(`Error: ObjectID is not valid.`);
        }

        try {
            const results = await delivery.deleteData(userID, objectID);
            //check result;
            if (results !== null && results !== -1) {
                //return if update is done by a staff;
                return res.end(`Delivery deleted successfully`);
            } else if (results === -1) {
                //return if client try to delete a delivery;
                return res.end(`Error: please contact the restaurant to cancel the delivery.`);
            } else {
                //return if delivery is not found;
                return res.end(`Error: delivery not found.`);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception delivery::delete");
            return res.status(500).json({ error: ex });
        }
    };

    const updateController = async (req, res) => {
        const userID = req.user;
        const id = req.params.objectID;
        let { order, address, comment, status, time, paid } = req.body;
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
        if (!order && !address && !comment && !status && !time && !paid) {
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
                    return res.end(`Error: please contact the restaurant to update delivery.`);
                }
            }
            if (address) {
                //validate address;
                const validAddress = await validations.addressValidation(address);
                if (!validAddress['lat'] || !validAddress['long']) {
                    //error if address is not valid;
                    return res.send('Error: Address is not valid.');
                } else {
                    data['address'] = address;
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
                const results = await delivery.updateData(objectID, data);
                //check result;
                if (results !== null) {
                    //return if delivery is updated;
                    return res.end(`Delivery updated successfully`);
                } else {
                    //return if delivery is not found;
                    return res.end(`Error: delivery not found.`);
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception delivery::update");
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
            //call delivery Model function with search and userID;
            const searchOrder = await delivery.search(search, userID);
            //check results
            if (searchOrder === null) {
                // return if delivery does not have search
                return res.status(404).json({
                    error: 404,
                    message: 'No delivery found',
                });
            } else {
                // return if search exists
                res.json(searchOrder);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception delivery::search.");
            return res.status(500).json({ error: ex })
        }
    };


    const lastOrderController = async (req, res) => {
        //userID = req.user;
        const {userID} = req.params;
        
        try {
            //call delivery Model function with search;
            const searchOrder = await delivery.lastOrder(userID);
            //check results
            if (searchOrder == null) {
                // return if delivery does not have search
                return res.status(404).json({
                    error: 404,
                    message: 'No delivery found',
                });
            } else {
                // return if search exists
                res.json(searchOrder);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception delivery::search.");
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