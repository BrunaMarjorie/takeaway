const { ObjectID } = require('mongodb');
const mail = require('../src/mail')();
const delivery = require('../model/deliveryModel')();
const validations = require('../src/validations')();
const waitingTime = '30 minutes'; //set waiting time;


module.exports = () => {

    const getController = async (req, res) => {
        //check user logged in;
        const user = req.user;
        //check if objectID is informed;
        const objectID = req.params.objectID;
        //check user status;
        const validateUser = await validations.userValidation(user);
        //call deliveryModel function;
        const deliveryList = await delivery.get(validateUser, objectID);
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
        const userID = req.user;
        //check user status;
        const validateUser = await validations.userValidation(userID);
        const orderType = validateUser['status'];
        let orders = [];
        //collect order information;
        let { costumer, date, order, address, comment, status, time, paid } = req.body;
        //validate entries;
        if (!costumer) {
            costumer = validateUser['id'];
        }
        if (!date) {
            date = new Date();
        }
        if (!order) {
            return res.send(`Error: order is missing.`); //return if no order is informed;
        } else {
            const valid = await validations.orderValidation(order, userID);
            if (valid == -1) {
                //return if no order is not valid;
                return res.send(`Error: order must have pairs of dish and quantity.`);
            } else if (valid == null) {
                //return if objectID is not valid;
                return res.send(`Error: ObjectID is not valid.`);
            } else {
                //return order with final price;
                orders.push(valid.order);
            }
        }
        if (address) {
            //validate address;
            const validAddress = await validations.addressValidation(address);           
            if (!validAddress['lat'] || !validAddress['long']) {
                //error if address is not valid;
                return res.send('Error: Address is not valid.');
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
        if (costumer && orders) {
            try {
                let results;
                if (orderType === 'admin' || orderType === 'staff') {
                    //call deliveryModel function;
                    results = await delivery.addByStaff(costumer, date, orders, address, comment, status, time, paid);
                } else {
                    //call deliveryModel function;
                    results = await delivery.addByCostumer(costumer, date, orders, comment, status, time, paid);
                }
                //check result;
                if (results !== null) {
                    const total = Object.values(orders)[0].total;
                    //send notification;
                    //const message = `Delivery ordered successfully. Waiting time: ${time}. Total: € ${total}`;
                    //mail.sendEmail(message, results);
                    //return if delivery is ordered;
                    return res.end(`Delivery ordered successfully. Waiting time: ${time}. Total: € ${total}`);
                } else {
                    return res.send('Error: Address is not valid.');
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception delivery::add");
                return res.status(500).json({ error: ex });
            }
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
        userID = req.user;
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