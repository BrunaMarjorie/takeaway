const { ObjectID } = require('mongodb');
const mail = require('../src/mail')();
const bookings = require('../model/bookingModel')();
const validations = require('../src/validations')();

module.exports = () => {

    const getController = async (req, res) => {
        //check user logged in;
        //const user = req.user;
        const user = 'staff';
        //check user status;
        //const validateUser = await validations.userValidation(user);
        //call bookingModel function;
        //const bookingsList = await bookings.get(validateUser);
        const bookingsList = await bookings.get(user);
        if (!bookingsList) {
            //return if no booking found;
            return res.status(404).json({
                error: 404,
                message: 'No booking found',
            });

        } else {
            //return general list of bookings;
            return res.json({ bookings: bookingsList });
        }
    };

    const getByDate = async (req, res) => {
        //check user logged in;
        const user = req.user;
        //check user status;
        const validateUser = await validations.userValidation(user);
        let date;
        try {
            date = new Date(req.params.date);
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception bookings::date.");
            return res.status(500).json({ error: ex })
        }
        try {
            //call bookingModel function with date parameter;
            const bookingsList = await bookings.get(validateUser, date);
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
            console.log("=== Exception bookings::getByDate.");
            return res.status(500).json({ error: ex })
        }
    };


    const postController = async (req, res) => {
        //collect client information;
        const { date, time, number, email, name, phoneNumber } = req.body;
        //let date = new Date(req.body.date); //convert date to Date format;
        //const userID = req.user._id;
        //const email = req.user.email;

        console.log('  inside post bookings');
        try {
            //call bookingModel function;
            const { results, error } = await bookings.add(date, time, number, email, name, phoneNumber);
            //check result;
            if (error) {
                //return if any error is found;
                console.log(error);
                res.status(400).send({ error });
            } else {
                //send notification;
                mail.sendEmail('created', email);
                //return if date is available;
                return res.end(`Booking successfull: ${email}, on ${date}`);
            }
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception bookings::add");
            return res.status(500).json({ error: ex });
        }
    };

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
            console.log("=== Exception bookings::delete/objectID");
            return res.send(`Error: ObjectID is not valid.`);
        }
        try {
            const results = await bookings.deleteData(objectID);
            //check result;
            if (results != null && results != -1) {
                //send notification;
                mail.sendEmail('deleted', results);
                //return if date is available;
                return res.end(`Booking deleted successfully`);
            } else if (results == -1) {
                //return if booking is at current date;
                return res.end(`Error: please contact the restaurant to cancel booking.`);
            } else {
                //return if booking is not found;
                return res.end(`Error: booking not found.`);
            }
        } catch (ex) {
            //return if any error occurs;s
            console.log("=== Exception bookings::delete");
            return res.status(500).json({ error: ex });
        }
    };

    const updateController = async (req, res) => {
        const id = req.params.objectID;
        const { date, time, number } = req.body;
        try {
            const { results, error } = await bookings.updateData(id, date, time, number);
            //check result;
            if (error) {
                //return if any error is found;
                console.log(error);
                res.status(400).send({error});
            } else {
                //send notification;
                mail.sendEmail('updated', results);
                //return if date is available;
                return res.end(`Booking updated successfully`);
            } 
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception bookings::update");
            return res.status(500).json({ error: ex });
        }
    };

    return {
        getController,
        getByDate,
        postController,
        deleteController,
        updateController
    }
}