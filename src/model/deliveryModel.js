const { ObjectID, Double } = require('mongodb');
const { use } = require('../routes');

const db = require('../database')(); //call database;
const mail = require('../mail')();
const COLLECTION = 'takeaway'; //name collection to database;


module.exports = () => {

    const get = async () => {
        console.log('   inside model takeaway');
        try {
            //get records when no date or time is informed;
            const takeaway = await db.get(COLLECTION);
            if (takeaway.length === 0) {
                return null;
            } else {
                return { takeawayList: takeaway };
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway::get");
            return { error: ex };
        }
    }

    const add = async (userID, order, comment, total, status, time, paid) => {
        console.log('  inside post takeaway');
        try {
            const results = await db.add(COLLECTION, {
                userID: userID,
                order: order,
                comment: comment,
                total: total,
                status: status,
                time: time,
                paid: paid
            });
            return results.result;
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway::add");
            return { error: ex };
        }
    };

    const deleteData = async (objectID) => {
        let userStatus;
        try {
            console.log('   inside delete model takeaway');
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            usertype = 'admin';
            if (valid.length > 0) {
                //userStatus === valid['status];
                if (usertype !== 'admin') {
                    //return if user is not an admin; 
                    return -1;
                } else {
                    //delete only if user is a staff;
                    try {
                        const del = await db.deleteData(COLLECTION, { '_id': ObjectID(objectID) });
                        return del;
                    } catch (ex) {
                        //return if any error occurs when connecting to database;
                        console.log("=== Exception takeaway model::delete");
                        return { error: ex };
                    }
                }
            } else {
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway::delete/find");
            return { error: ex };
        }
    }

    const updateData = async (objectID, data) => {
        try {
            console.log('   inside update model takeaway');
            //find booking using objectID;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
                return null;
            } else {
                try {
                    //collect user email;
                    const email = Object.values(valid)[0].email;
                    const filter = { '_id': ObjectID(objectID) };
                    const updateDoc = { '$set': data };
                    const put = await db.updateData(COLLECTION, filter, updateDoc);
                    return email;
                } catch (ex) {
                    //return if any error occurs when connecting to database;
                    console.log("=== Exception takeaway::update");
                    return { error: ex };
                }
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway::update/find");
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