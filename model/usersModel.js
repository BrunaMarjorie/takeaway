const { ObjectID } = require('mongodb');
const db = require('../src/database')();
const COLLECTION = 'users';
const bcrypt = require('bcrypt');
const validations = require('../src/validations')();
const mail = require('../src/mail')();

module.exports = () => {
    const get = async (userID = null, objectID = null) => {
        console.log('   inside users model');
        if (userID['status'] === 'admin' && objectID === null) {
            //if user status is admin, they can access staff information;
            try {
                const query = { 'status': 'staff' }; //filter the access;
                //select information that can be accessed;
                const project = { 'name': 1 };
                const users = await db.find(COLLECTION, query, project);
                if (users.length != 0) {
                    return users;
                } else {
                    return null;
                }
            } catch (ex) {
                console.log("=== Exception user::get");
                return { error: ex };
            }
        } else if (userID['status'] === 'admin' && objectID !== null) {
            //routine if objectID is passed;
            try {
                const query = { 'status': 'staff', '_id': ObjectID(objectID) }; //filter the access;
                //select information that can be accessed;
                const project = { 'name': 1, 'email': 1, 'phoneNumber': 1, 'address': 1 };
                const users = await db.find(COLLECTION, query, project);
                if (users.length != 0) {
                    return users;
                } else {
                    return null;
                }
            } catch (ex) {
                console.log("=== Exception user::get");
                return { error: ex };
            }
        } else {
            try {
                const query = { '_id': ObjectID(userID['id']) }; //filter the access;
                //select information that can be accessed;
                const project = { 'name': 1, 'email': 1, 'phoneNumber': 1, '_id': 0, 'address': 1 };
                const users = await db.find(COLLECTION, query, project);
                //check if user exists;
                if (users.length != 0) {
                    return users;
                } else {
                    return null;
                }
            } catch (ex) {
                console.log("=== Exception user::get{userID}");
                return { error: ex };
            }
        }
    }

    const add = async (name, email, status, password, confPassword) => {
        let hash;
        if (!name) {
            //error if no name is informed.
            return { error: 'Name is missing.' };
        }
        if (!email) {
            //error if no email is informed;
            return { error: 'Email is missing.'};
        } else {
            //validate email format;
            const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            if (!mailformat.test(String(email).toLowerCase())) {
                return { error: 'Email format is not valid.'};
            }
        }
        if (!status) {
            //set status as 'costumer' if no status is informed;
            status = 'costumer';
            //validate usertype;
        } else if (status !== "admin" && status !== "staff" && status !== "costumer") {
            return { error: `User status is not valid. It must be 'admin', 'staff' or 'costumer'.`};
        }
        if (!password) {
            //error if no password is informed;
            return {error: 'Password is missing.'};
        } else {
            if (password !== confPassword){
                return {error: 'Password confirmation does not match.'};
            } else {
                hash = bcrypt.hashSync(password, 10);
            }
        }

        console.log('   inside users model');
        let valid;
        try {
            //checking if email is unique;
            valid = await db.get(COLLECTION, { email });
        } catch (ex) {
            console.log("=== Exception user::get{email}");
            return { error: ex };
        }
        if (valid.length === 0) {
            try {
                const results = await db.add(COLLECTION, {
                    name: name,
                    email: email,
                    status: status,
                    password: hash,
                });
                return results.result;
            } catch (ex) {
                console.log("=== Exception user::add");
                return { error: ex };
            }
        } else {
            return { error: 'User already exists in our system.'};
        }
    };

    const deleteData = async (objectID) => {
        try {
            console.log('   inside delete model users');
            //find if user exists;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            //collect email information to send notification;
            const email = Object.values(valid)[0].email;
            if (valid.length > 0) {
                //delete routine;
                try {
                    const del = await db.deleteData(COLLECTION, { '_id': ObjectID(objectID) });
                    return email;
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

    const updateData = async (userID, data) => {
        try {
            console.log('   inside update model users');
            //find user using objectID;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(userID) });
            if (valid.length > 0) {
                try {
                    //collect user email;
                    const email = Object.values(valid)[0].email;
                    //filter the booking to be updated;
                    const filter = { '_id': ObjectID(userID) };
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

    const search = async (search) => {
        console.log('   inside search user');
        if (!search) {
            return null;
        } else {
            try {
                console.log(search);
                //get user with filter;
                const filter = { '$text': { '$search': search } };
                const user = await db.get(COLLECTION, filter);
                if (user.length === 0) {
                    return null;
                } else {
                    return user;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception user::get");
                return { error: ex };
            }
        }
    }

    return {
        get,
        add,
        deleteData,
        updateData,
        search
    }
}