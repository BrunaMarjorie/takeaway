const { ObjectID } = require('mongodb');

const bookings = require('../model/bookingModel')();

module.exports = () => {

    const getController = async (req, res) => {
        //call bookingModel function;
        const { bookingsList, error } = await bookings.get();
        if (error) {
            //return if any error occurs;
            return res.status(500).json({ error })
        } else {
            //return general list of bookings;
            res.json({ bookings: bookingsList });
        }
    };

    const getByDate = async (req, res) => {
        try {
            //call bookingModel function with date parameter;
            const bookingsList = await bookings.get(req.params.date);
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
        const date = req.params.date;
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
        //collect client information;
        let { name, email, phone, time, number } = req.body;
        let numTables = Number(); //set number of tables as an integer;
        let numPeople = Number(); //set number of people as an integer;
        let date = new Date(req.body.date); //convert date to Date format;
        //validate entries;
        if (!name) {
            return res.send(`Error: name is missing.`); //return if no name is informed;
        }
        if (!email) {
            return res.send(`Error: email is missing.`); //return if no email is informed;
        } else {
            //validate email format;
            const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!mailformat.test(String(email).toLowerCase())) {
                return res.send(`Error: email format not valid.`); //return if email format is not valid;
            }
        }
        if (!phone) {
            return res.send(`Error: phone is missing.`); //return if no phone number is informed;
        } else {
            //validate phone number format;
            phone = phone.replace(/[^0-9]/g, '');
            if (phone.length != 10) {
                //return if phone number format is not valid;
                return res.send(`Error: phone number format not valid.`);
            }
        } if (!date) {
            return res.send(`Error: date is missing.`); //return if no date is informed;
        } else {
            if (!isNaN(date.getDay())) { //check if date format is valid;
                const currentDate = new Date ();
                if (date.getDay() == 2) { //check day of the week;
                    //return if restaurant is closed on the booking day;
                    return res.send(`Restaurant is not open on Tuesdays.`);
                } else if (currentDate > date) {
                    //return if booking day is on the past;
                    return res.send(`Error: Date not valid.`);
                } else {
                    //if valide date and day, convert date to DD/MM/YYYY format;
                    date = date.getUTCDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                }
            } else {
                //return if date format informed is not valid;
                return res.send(`Error: date format must be YYYY-MM-DD.`);
            }
        }
        if (!time) {
            return res.send(`Error: time is missing.`); //return if no time is informed;
        } else {
            //check if time informed is available for booking;
            if (time != 16 && time != 18 && time != 20) {
                return res.send(`Bookings are only available at 16h, 18h and 20h.`)
            }
        }
        if (!number) {
            //return if no number of people is informed;
            return res.send(`Error: number of people is missing.`);
        } else {
            numPeople = parseInt(number); //convert number informed to Integer;
            //calculate the number of tables needed (round number upward);
            numTables = Math.ceil(numPeople / 4);
            if (!numTables) {
                //return if number informed is not a valid integer;
                console.log("=== Exception bookings::number");
                return res.send('Error: number is not a valid integer');
            }
        }
        //method starts only after all the items are passed;
        if (name && email && phone && date && time && numPeople && numTables) {
            console.log('  inside post bookings');
            try {
                //call bookingModel function;
                const results = await bookings.add(name, email, phone, date, time, numPeople, numTables);
                //check result;
                if (results != null) {
                    //return if date is available;
                    res.end(`Booking successfull: ${name}, on ${date}, at ${time}:00`);
                } else {
                    //return if date is not available;
                    res.end(`Error: spot is fully booked.`);
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
                //return if date is available;
                res.end(`Booking deleted successfully`);
            } else if (results == -1) {
                //return if booking is at current date;
                res.end(`Error: please contact the restaurant to cancel booking.`);
            } else {
                //return if date is not available;
                res.end(`Error: booking not found.`);
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
        if (!date && !time && !number) {
            //return if no valid information is passed;
            return res.send(`Error: inform item(date, time or number of people) to be updated.`);
        } else {
            if (date && time) { //routine if date and time are passed;
                const currentDate = new Date();
                let newDate = new Date(date);
                if (!isNaN(newDate.getDay())) { //check if date format is valid;
                    if (newDate.getDay() == 2) { //check day of the week;
                        //return if restaurant is closed on the booking day;
                        return res.send(`Restaurant is not open on Tuesdays.`);
                    } else if (currentDate > newDate) {
                        //return if booking day is on the past;
                        return res.send(`Error: Date not valid.`);
                    } else {
                        //if valide date and day, convert date to DD/MM/YYYY format;
                        date = newDate.getUTCDate() + "-" + (newDate.getMonth() + 1) + "-" + newDate.getFullYear();
                        //assing date to object data;
                        data['date'] = date;
                    }
                } else {
                    //return if date format informed is not valid;
                    return res.send(`Error: date format must be YYYY-MM-DD.`);
                }
                //check if time informed is available for booking;
                if (time != 16 && time != 18 && time != 20) {
                    return res.send(`Bookings are only available at 16h, 18h and 20h.`)
                } else {
                    //assing time to object data;
                    data['time'] = time;
                }
            } else if ((!date && time) || (date && !time)) {
                return res.send('Error: please inform date and time.');
            }
            if (number) {
                let numPeople = Number();
                let numTables = Number();
                numPeople = parseInt(number); //convert number informed to Integer;
                //calculate the number of tables needed (round number upward);
                numTables = Math.ceil(numPeople / 4);
                if (!numTables) {
                    //return if number informed is not a valid integer;
                    console.log("=== Exception bookings::number");
                    return res.send('Error: number is not a valid integer');
                } else {
                    data['numPeople'] = numPeople;
                    data['numTables'] = numTables;
                }
            }
            try {
                const results = await bookings.updateData(objectID, data);
                //check result;
                if (results != null && results != -1 && results != 0) {
                    //return if date is available;
                    res.end(`Booking updated successfully`);
                } else if (results == -1) {
                    //return if booking is at current date;
                    res.end(`Error: please contact the restaurant to update booking.`);
                } else if (results == 0) {
                    //return if date is not available;
                    res.end(`Error: spot is fully booked.`);
                }else {
                    //return if date is not available;
                    res.end(`Error: booking not found.`);
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