const { ObjectID } = require('mongodb');

const db = require('../database')(); //call database;
//const mail = require('../mail')();
const COLLECTION = 'bookings'; //name collection to database
const maxTables = "4"; //set max number of tables available


module.exports = () => {

    const get = async (date = null, time = null) => {
        console.log('   inside model bookings');
        if (!date && !time) {
            try {
                //get records when no date or time is informed;
                const bookings = await db.get(COLLECTION);
                return { bookingsList: bookings };
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception bookings::get");
                return { error: ex };
            }
        } else if (date && !time) {
            try {
                //get records when only date informed;
                const bookings = await db.get(COLLECTION, { date });
                //check results;           
                if (bookings.length != 0) {
                    //extract number of tables booked;
                    let tables = Object.values(await db.findBookings(date, time))[0];
                    //extract number of people booked;
                    let people = Object.values(await db.findBookings(date, time))[1];
                    //return if date has bookings;  
                    return { tables, people, bookings };
                } else {
                    //return if no booking is found;
                    return null;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception bookings::get{date}");
                return { error: ex };
            }
        } else {
            try {
                //get records when date and time are informed;
                const bookings = await db.get(COLLECTION, { date, time });
                //check results;          
                if (bookings.length != 0) {
                    //return if date and time has bookings;
                    return { bookings };
                } else {
                    //return if no booking is found;
                    return null;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception bookings::get{date, time}");
                return { error: ex };
            }
        }
    }

    const add = async (name, email, phone, date, time, numPeople, numTables) => {
        let valid;
        try {
            //check if spot has already any bookings;
            const bookings = await db.findBookings(date, time);
            if (!bookings) {
                //return if no booking is found;
                valid = 0;
            } else {
                //extract number of tables booked;
                valid = Object.values(bookings)[0];
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception bookings::find");
            return { error: ex };
        }
        //check availability;
        if ((valid + numTables) <= maxTables) {
            try {
                //if available, connect to database;
                const results = await db.add(COLLECTION, {
                    name: name,
                    email: email,
                    phoneNumber: phone,
                    date: date,
                    time: time,
                    numPeople: numPeople,
                    numTables: numTables
                });
                return results.result;
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception bookings::add");
                return { error: ex };
            }
        } else {
            //return null if spot is not available;
            return null;
        }
    };

    const deleteData = async (objectID) => {
        try {
            console.log('   inside delete model bookings');
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
                const bookingDate = Object.values(valid)[0].date;
                const date = new Date();
                currentDate = date.getUTCDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                //compare booking date and current date;
                if (currentDate === bookingDate) {
                    //return if booking is at current date; 
                    return -1;
                } else {
                    //delete if more than 1 day of booking;
                    try {
                        const del = await db.deleteData(COLLECTION, { '_id': ObjectID(objectID) });
                        return del;
                    } catch (ex) {
                        //return if any error occurs when connecting to database;
                        console.log("=== Exception bookings::delete");
                        return { error: ex };
                    }
                }
            } else {
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception bookings::delete/find");
            return { error: ex };
        }
    }

    const updateData = async (objectID, data) => {
        console.log(data);
        try {
            console.log('   inside update model bookings');
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
                const bookingDate = Object.values(valid)[0].date;
                const date = new Date();
                currentDate = date.getUTCDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
                //compare booking date and current date;
                if (currentDate === bookingDate) {
                    //return if booking is at current date; 
                    return -1;
                } else {
                    //update if more than 1 day of booking;
                    try {
                        const filter = { '_id': ObjectID(objectID) };
                        const updateDoc = { '$set': data };
                        const put = await db.updateData(COLLECTION, filter, updateDoc);
                        return put;
                    } catch (ex) {
                        //return if any error occurs when connecting to database;
                        console.log("=== Exception bookings::update");
                        return { error: ex };
                    }
                }
            } else {
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception bookings::update/find");
            return { error: ex };
        }
    }

    return {
        get,
        add,
        deleteData,
        updateData,
    }
}