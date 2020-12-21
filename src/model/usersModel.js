const { ObjectID } = require('mongodb');
const db = require('../database')();
const COLLECTION = 'users';
const bcrypt = require('bcrypt');

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

    const getByKey = async (userEmail, key) => {
        console.log('   inside users password');
        if (!userEmail || !key) {
            console.log(" Error: Missing user email and/or password.");
            return null;
        } else {
            try {
                //look up and match user key;        
                const users = await db.findKeys();
                for (i in users) {
                    if (bcrypt.compareSync(key, users[i].key)) {
                        const user = users[i].email;
                        if (user === userEmail){
                            return user;
                        } else {
                            return -1;
                        }
                    }
                }
                console.log(" Error: User not found.");
                return null;
            } catch (ex) {
                console.log("=== Exception user::getByKey");
                return { error: ex };
            }
        }
    }

    const add = async (name, email, phoneNumber, usertype, password) => {
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
                    name: name,
                    email: email,
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
  

    return {
        get,
        add,
        getByKey,
        deleteData,
    }
}