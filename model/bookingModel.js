const { ObjectID } = require('mongodb');
const db = require('../src/database')(); //call database;
const COLLECTION = 'bookings'; //name collection to database
const maxTables = "4"; //set max number of tables available


module.exports = () => {

    const get = async (userID = null, date = null) => {
        console.log('   inside model bookings');
        let filter;
        let project;
        if (!date) {
            try {
                if (userID['status'] === 'costumer') {
                    filter = { 'userID': userID['id'] }; //filter the access;    
                } else {
                    filter = {}; //filter the access;
                }
                //select information that can be accessed;
                project = {};
                const bookings = await db.find(COLLECTION, filter, project);
                if (bookings.length === 0) {
                    return null;
                } else {
                    return bookings;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception bookings::get");
                return { error: ex };
            }
        } else if (date) {
            date.setHours(0); //set initial hour of the day;
            const dayAfter = new Date(date);
            dayAfter.setDate(date.getDate() + 1); //set final hour (24h);
            if (userID['status'] === 'costumer') {
                return null; //filter the access;    
            } else {
                try {
                    //select bookings between the initial and final hour;
                    filter = { 'date': { '$gte': date, '$lt': dayAfter } };
                    //get records when only date informed;
                    const bookings = await db.get(COLLECTION, filter);
                    //check results;           
                    if (bookings.length != 0) {
                        //extract number of tables booked;
                        let tables = Object.values(await db.findBookings(filter))[0];
                        //extract number of people booked;
                        let people = Object.values(await db.findBookings(filter))[1];
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
            }
        }
    }

    const add = async (userID, date, numPeople, numTables) => {
        let tablesAlreadyBooked = Number(); //number of tables already booked;
        let bookings;
        try {
            //check if spot has already any bookings;
            bookings = await db.findBookings({ date });
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception bookings::find");
            return { error: ex };
        }
        if (Object.keys(bookings).length <= 0) {
            //set tables booked as '0' if no booking is found;
            tablesAlreadyBooked = 0;
        } else {
            //extract number of tables already booked;
            tablesAlreadyBooked = Object.values(bookings)[0];
        }
        //check availability;
        if ((tablesAlreadyBooked + numTables) <= maxTables) {
            try {
                //if available, connect to database;
                const results = await db.add(COLLECTION, {
                    userID: userID,
                    date: date,
                    numPeople: numPeople,
                    numTables: numTables
                });
                //return user email;
                return results;
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
            //find if booking exists;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
                //collect date of booking to be deleted;
                const bookingDate = new Date(Object.values(valid)[0].date);
                //collect current date;
                const currentDate = new Date();
                //compare booking date and current date;
                if ((bookingDate.getDate() - currentDate.getDate()) <= 2) {
                    //return if booking is less than 2 days away; 
                    return -1;
                } else {
                    //delete if more than 1 day of booking;
                    try {
                        //collect user email;
                        const email = Object.values(valid)[0].email;
                        const del = await db.deleteData(COLLECTION, { '_id': ObjectID(objectID) });
                        //return user email;
                        return email;
                    } catch (ex) {
                        //return if any error occurs when connecting to database;
                        console.log("=== Exception bookings model::delete");
                        return { error: ex };
                    }
                }
            } else {
                //return if no booking is found;
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception bookings::delete/find");
            return { error: ex };
        }
    }

    const updateData = async (objectID, data) => {
        try {
            console.log('   inside update model bookings');
            //find booking using objectID;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
                //collect date of booking to be updated;
                const bookingDate = new Date(Object.values(valid)[0].date);
                //collect current date;
                const currentDate = new Date();
                //compare booking date and current date;
                if ((bookingDate.getDate() - currentDate.getDate()) <= 2) {
                    //return if booking is less than 2 days away; 
                    return -1;
                } else {
                    //check if data to be updated has date property;
                    if ((data.hasOwnProperty('date')) && (data.hasOwnProperty('time'))) {
                        const date = data['date']; //date to be updated;
                        const numTables = data['numTables']; //number of tables to be updated;
                        let tablesAlreadyBooked = Number(); //number of tables already booked;
                        let booking;
                        try {
                            //check if spot has already any bookings;
                            booking = await db.findBookings({ date });
                        } catch (ex) {
                            //return if any error occurs when connecting to database;
                            console.log("=== Exception bookings::update/find");
                            return { error: ex };
                        }
                        //check bookings;
                        if (Object.keys(booking).length <= 0) {
                            //set tables booked as '0' if no booking is found;
                            tablesAlreadyBooked = 0;
                        } else {
                            //extract number of tables booked;
                            tablesAlreadyBooked = Object.values(booking)[0];
                        }
                        //check availability
                        if ((tablesAlreadyBooked + numTables) >= maxTables) {
                            //return if fully booked;
                            return 0;
                        }
                    }
                    //update if more than 1 day of booking;
                    try {
                        //collect user email;
                        const email = Object.values(valid)[0].email;
                        //filter the booking to be updated;
                        const filter = { '_id': ObjectID(objectID) };
                        //set info to be updated;
                        const updateDoc = { '$set': data };
                        const put = await db.updateData(COLLECTION, filter, updateDoc);
                        //return user email;
                        return email;
                    } catch (ex) {
                        //return if any error occurs when connecting to database;
                        console.log("=== Exception bookings::update");
                        return { error: ex };
                    }
                }
            } else {
                //return if no booking is found;
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