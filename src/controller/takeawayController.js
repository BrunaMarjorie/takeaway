const { ObjectID } = require('mongodb');
const mail = require('../mail')();
const takeaway = require('../model/takeawayModel')();
const validations = require('../validations')();
const waitingTime = Number(15); //set waiting time;

module.exports = () => {

    const getController = async (req, res) => {
        //call takeawayModel function;
        const takeawayList = await takeaway.get();
        if (!takeawayList) {
            //return if no takeaway found;
            return res.status(404).json({
                error: 404,
                message: 'No takeaway found',
            });

        } else {
            //return general list of takeaway;
            return res.json({ takeaway: takeawayList });
        }
    };

    const getByDate = async (req, res) => {
        const date = new Date(req.params.date);
        try {
            //call bookingModel function with date parameter;
            const bookingsList = await bookings.get(date);
            //check results
            if (bookingsList == null) {
                // return if booking does not exist
                return res.status(404).json({
                    error: 404,
                    message: 'Booking not found',
                });
            } else {
                // return if booking exists
                res.json(bookingsList);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception projects::getByDate.");
            return res.status(500).json({ error: ex })
        }
    };

    const getByDateAndTime = async (req, res) => {
        const date = new Date(req.params.date);
        const time = req.params.time;
        try {
            //call bookingModel function with date and time parameters;
            const bookingsList = await bookings.get(date, time);
            //check results
            if (bookingsList == null) {
                //return if booking does not exist
                res.status(404).json({
                    error: 404,
                    message: 'Booking not found',
                });
            } else {
                //return if booking exists
                res.json(bookingsList);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception projects::getByDateAndTime.");
            return res.status(500).json({ error: ex })
        }
    };

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
    };

    const deleteController = async (req, res) => {
        const id = req.params.objectID;
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
            const results = await takeaway.deleteData(objectID);
            //check result;
            if (results != null && results != -1) {
                //return if update is done by a staff;
                return res.end(`Takeaway deleted successfully`);
            } else if (results == -1) {
                //return if client try to delete a takeaway;
                return res.end(`Error: please contact the restaurant to cancel the takeaway.`);
            } else {
                //return if takeaway is not found;
                return res.end(`Error: takeaway not found.`);
            }
        } catch (ex) {
            //return if any error occurs;s
            console.log("=== Exception bookings::delete");
            return res.status(500).json({ error: ex });
        }
    };

    const updateController = async (req, res) => {
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
                const total = await validations.validateOrder(order);
                data['order'] = order;
                data['total'] = total;
            }
            if (comment) {
                data['numPeople'] = Object.values(results)[0];
                data['numTables'] = Object.values(results)[1];
            }
            if (time) {
                data['time'] = time;
            }
            if (status) {
                data['status'] = status;
            }
            if (paid){
                data['paid'] = paid;
            }
            try {
                const results = await bookings.updateData(objectID, data);
                //check result;
                if (results != null && results != -1 && results != 0) {
                    //send notification;
                    mail.sendEmail('updated', results);
                    //return if date is available;
                    return res.end(`Booking updated successfully`);
                } else if (results == -1) {
                    //return if booking is at current date;
                    return res.end(`Error: please contact the restaurant to update booking.`);
                } else if (results == 0) {
                    //return if date is not available;
                    return res.end(`Error: bookings not available for ${data['numPeople']} people.`);
                } else {
                    //return if date is not available;
                    return res.end(`Error: booking not found.`);
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
        getByDate,
        getByDateAndTime,
        postController,
        deleteController,
        updateController
    }
}