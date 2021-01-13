const { ObjectID } = require('mongodb');
const mail = require('../src/mail')();
const bookings = require('../model/bookingModel')();
const validations = require('../src/validations')();

module.exports = () => {

    const getController = async (req, res) => {
        //check user logged in;
        const user = req.user;
        //check user status;
        const validateUser = await validations.userValidation(user);
        //call bookingModel function;
        const bookingsList = await bookings.get(validateUser);
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
        try{
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
        let { time, number } = req.body;
        let numTables = Number(); //set number of tables as an integer;
        let numPeople = Number(); //set number of people as an integer;
        let date = new Date(req.body.date); //convert date to Date format;
        const userID = req.user._id;
        const email = req.user.email;
        //validate entries;
        if (!date || !time) {
            return res.send(`Error: date and/or time is missing.`); //return if no date ot time is informed;
        } else {
            //validate date format;
            const results = await validations.dateValidation(date, time);
            if (results === -1) {
                //return if date is a Tuesday;
                return res.send(`Restaurant is not open on Tuesdays.`);
            } else if (results === 0) {
                //return if date is in the past;
                return res.send(`Error: Date not valid.`);
            } else if (results === null) {
                //return if date format is not valid;
                return res.send(`Error: date format must be YYYY-MM-DD.`);
            } else if (results === 1) {
                //return if time is not available for bookings;
                return res.send(`Bookings are only available at 16h, 18h and 20h.`);
            } else {
                //assign date to the new format;
                date = Object.values(results)[0];
            }
        }
        if (!number) {
            //return if no number of people is informed;
            return res.send(`Error: number of people is missing.`);
        } else {
            //validate number of people;
            const results = await validations.validPeopleNumber(number);
            if (results == null) {
                //return if number is not an integer;
                return res.send('Error: number is not a valid integer');
            } else {
                //if valid number, collect data to be posted;
                numPeople = Object.values(results)[0];
                numTables = Object.values(results)[1];
            }
        }
        //method starts only after all the items are passed;
        if (userID && date && time && numPeople && numTables) {
            console.log('  inside post bookings');
            try {
                //call bookingModel function;
                const results = await bookings.add(userID, date, numPeople, numTables);
                //check result;
                if (results != null) {
                    //send notification;
                    mail.sendEmail('created', email);
                    //return if date is available;
                    return res.end(`Booking successfull: ${userName}, on ${date}`);
                } else {
                    //return if date is not available;
                    return res.end(`Error: bookings not available for ${numPeople} people.`);
                }
            } catch (ex) {
                //return if any error occurs;
                console.log("=== Exception bookings::add");
                return res.status(500).json({ error: ex });
            }
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
        let { date, time, number } = req.body;
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
        if (!date && !time && !number) {
            //return if no valid information is passed;
            return res.send(`Error: inform item(date, time or number of people) to be updated.`);
        } else {
            if (date && time) { //routine if date and time are passed;
                //convert  date passed in date format;
                let newDate = new Date(date);
                //validate date;
                const results = await validations.dateValidation(newDate, time);
                if (results === -1) {
                    //return if date is a Tuesday;
                    return res.send(`Restaurant is not open on Tuesdays.`);
                } else if (results === 0) {
                    // return if date is in the past;
                    return res.send(`Error: Date not valid.`);
                } else if (results === null) {
                    //return if date format is not valid;
                    return res.send(`Error: date format must be YYYY-MM-DD.`);
                } else if (results === 1) {
                    //return if time is not available for bookings;
                    return res.send(`Bookings are only available at 16h, 18h and 20h.`);
                } else {
                    //assign values to data to be updated;
                    data['date'] = date;
                    data['time'] = time;
                }
            } else if ((!date && time) || (date && !time)) {
                return res.send('Error: please inform date and time.');
            }
            if (number) {
                //validate number of people;
                const results = await validations.validPeopleNumber(number);
                if (results == null) {
                    //return if number is not an integer;
                    return res.send('Error: number is not a valid integer');
                } else {
                    //assign values to data to be updated;
                    data['numPeople'] = Object.values(results)[0];
                    data['numTables'] = Object.values(results)[1];
                }
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
                    //return if booking is not in the database;
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
        postController,
        deleteController,
        updateController
    }
}