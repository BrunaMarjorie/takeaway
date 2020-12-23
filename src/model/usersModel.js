const { ObjectID } = require('mongodb');
const db = require('../database')();
const COLLECTION = 'users';

module.exports = () => {
    const get = async (email = null) => {

        console.log('   inside users model');
        if (!email) {
            try {
                const users = await db.get(COLLECTION);
                return { usersList: users };
            } catch (ex) {
                console.log("=== Exception user::get");
                return { error: ex };
            }
        } else {
            try {
                const users = await db.get(COLLECTION, { email });
                //check if user exists;
                if (users.length != 0) {
                    return { users };
                } else {
                    return null;
                }
            } catch (ex) {
                console.log("=== Exception user::get{email}");
                return { error: ex };
            }
        }
    }

    const add = async (firstName, lastName, email, address, phoneNumber, usertype, password) => {
        console.log('   inside users model');
        let valid;
        try {
            //checking if email is unique;
            valid = await db.find(COLLECTION, { email });
        } catch (ex) {
            console.log("=== Exception user::find{email}");
            return { error: ex };
        }
        if (!valid) {
            try {
                const results = await db.add(COLLECTION, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    address: address,
                    phoneNumber: phoneNumber,
                    usertype: usertype,
                    password: password,
                });
                return results.result;
            } catch (ex) {
                console.log("=== Exception user::add");
                return { error: ex };
            }
        } else {
            return null;
        }
    };

    const deleteData = async (objectID) => {
        console.log("id: " + objectID);
        try {
            console.log('   inside delete model users');
            //find if user exists;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
                //delete routine;
                try {
                    const del = await db.deleteData(COLLECTION, { '_id': ObjectID(objectID) });
                    return del;
                } catch (ex) {
                    //return if any error occurs when connecting to database;
                    console.log("=== Exception users model::delete");
                    return { error: ex };
                }
            } else {
                //return if user is not found;
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception users::delete/find");
            return { error: ex };
        }
    }

    const updateData = async (objectID, data) => {
        try {
            console.log('   inside update model users');
            //find user using objectID;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
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
                    console.log("=== Exception users::update");
                    return { error: ex };
                }
            } else {
                //return if no user is found;
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception users::update/find");
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