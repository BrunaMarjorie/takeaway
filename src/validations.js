const db = require('./database')(); //call database;
const { ObjectID } = require('mongodb');
const Nominatim = require('nominatim-geocoder');
const geocoder = new Nominatim();


module.exports = () => {

    const dateValidation = async (date, time) => {
        const newDate = new Date(date);
        if (!isNaN(newDate.getDay())) { //check if date format is valid;
            const currentDate = new Date();
            if (currentDate > newDate) {
                //return if booking day is on the past;
                return 0;
            } else if (newDate.getDay() == 2) { //check day of the week;
                //return if restaurant is closed on the booking day;
                return -1;
            }
        } else {
            //return if date format informed is not valid;
            return null;
        }
        //check if time informed is available for booking;
        if (time != 16 && time != 18 && time != 20) {
            return 1;
        } else {
            newDate.setHours(time, 0, 0, 0);
        }

        const validDate = { 'date': newDate, 'time': time }
        return validDate;
    }

    const validPeopleNumber = async (number) => {
        let numPeople = Number();
        let numTables = Number();
        numPeople = parseInt(number); //convert number informed to Integer;
        //calculate the number of tables needed (round number upward);
        numTables = Math.ceil(numPeople / 4);
        if (!numTables) {
            //return if number informed is not a valid integer;
            console.log("=== Exception bookings::number");
            return null;
        }

        const validNUmber = { 'numPeople': numPeople, 'numTables': numTables }
        return validNUmber;
    }

    const orderValidation = async (order, userID, orderID) => {
        let id;
        let objectID;
        let orderTotalPrice = Number();
        let valid;
        let userStatus;
        let temp = {};
        const array = [];
        try {
            valid = await db.get('users', { '_id': ObjectID(userID) });
            userStatus = (Object.values(valid)[0].status);
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception order validation::get");
            return null;
        }
        for (i = 0; i < order.length; i++) {
            if (!order[i].hasOwnProperty('dish') || !order[i].hasOwnProperty('quantity')) {
                return -1;
            } else {
                id = order[i].dish;
                try {
                    if (new ObjectID(id).toHexString() === id) {
                        objectID = id;
                    }
                } catch (ex) {
                    //return if any error occurs;
                    console.log("=== Exception order validation::objectID");
                    return null;
                }
                try {
                    valid = await db.get('menu', { '_id': ObjectID(objectID) });
                } catch (ex) {
                    //return if any error occurs;
                    console.log("=== Exception order validation::get");
                    return null;
                }
                if (valid.length > 0) {
                    const item = Object.values(valid)[0].number;
                    const dish = Object.values(valid)[0].dish;
                    const quantity = (order[i].quantity);
                    if (quantity <= 0 && userStatus === 'costumer') {
                        return null;
                    }
                    const price = (Object.values(valid)[0].price);
                    orderTotalPrice += (quantity * price);
                    temp = { item: item, dish: dish, quantity: quantity, price: price };
                    array.push(temp);
                } else {
                    return null;
                }
            }
        }
        return {orders: array, total: orderTotalPrice};
    }

    const userValidation = async (userID) => {
        let valid;
        try {
            valid = await db.get('users', { '_id': ObjectID(userID) });
        } catch (ex) {
            //return if any error occurs;
            console.log("=== Exception user validation::get");
            return null;
        }
        if (valid) {
            const status = (Object.values(valid)[0].status);
            return { 'status': status, 'id': userID };

        } else {
            return null;
        }
    }

    const addressValidation = async (address) => {
        let lat;
        let long;
        //query address using Nominatim;
        const results = await geocoder.search({ q: address })
            .then((response) => {
                //collect info if only one result is found;
                if (response.length === 1) {
                    lat = response[0].lat;
                    long = response[0].lon;
                } else {
                    //return if result is null or more than one address is found;
                    lat = null;
                    long = null;
                }
            })
            .catch((error) => {
                console.log(error);
            });
        return { 'lat': lat, 'long': long }
    }

    return {
        dateValidation,
        validPeopleNumber,
        orderValidation,
        userValidation,
        addressValidation
    }
}