const { ObjectID } = require('mongodb');
const db = require('../src/database')(); //call database;
const COLLECTION = 'takeaway'; //name collection to database;


module.exports = () => {

    const get = async (userID = null, objectID = null) => {
        console.log('   inside model takeaway');
        if ((userID['status'] === 'admin' || userID['status'] === 'staff')
            && objectID === null) {
            //if user is staff or admin, they can access all the takeaways;
            try {
                const query = {'status': 'open'}; //filter the access;
                //select information that can be accessed;
                const project = { 'costumer': 1 };
                const takeaway = await db.find(COLLECTION, query, project);
                if (takeaway.length === 0) {
                    return null;
                } else {
                    return takeaway;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception takeaway::get");
                return { error: ex };
            }

        } else if ((userID['status'] === 'admin' || userID['status'] === 'staff')
            && objectID !== null) { //routine if objectID is passed;
            //if user is staff or admin, they can access all the takeaways;
            try {
                const query = { '_id': ObjectID(objectID) }; //filter the access;
                //select information that can be accessed;
                const project = {};
                const takeaway = await db.find(COLLECTION, query, project);
                if (takeaway.length === 0) {
                    return null;
                } else {
                    return takeaway;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception takeaway::get");
                return { error: ex };
            }
        } else {
            try {
                //if user is a costumer, only their takeaways can be accessed;
                const takeaway = await db.get(COLLECTION, { 'userID': userID['id'] });
                if (takeaway.length === 0) {
                    return null;
                } else {
                    return takeaway;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception takeaway::get");
                return { error: ex };
            }
        }
    }

    const addByStaff = async (costumer, date, orders, comment, status, time, paid) => {
        console.log('  inside post takeaway');
        try {
            const results = await db.add(COLLECTION, {
                costumer: costumer,
                date: date,
                orders: orders,
                comment: comment,
                status: status,
                time: time,
                paid: paid
            });
            return results.result;

        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway model::add");
            return { error: ex };
        }
    };

    const addByCostumer = async (userID, date, orders, comment, status, time, paid) => {
        console.log('  inside post takeaway');
        let user;
        let costumer;
        let email;
        try {
            //check user id and collect user name;
            user = await db.get('users', { '_id': ObjectID(userID) });
            costumer = user[0].name;
            email = user[0].email; //collect user email to send notification;
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway model::user");
            return { error: ex };
        }
        try {
            const results = await db.add(COLLECTION, {
                userID: userID,
                costumer: costumer,
                date: date,
                orders: orders,
                comment: comment,
                status: status,
                time: time,
                paid: paid
            });
            //return email to send notification;
            return email;
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway model::add");
            return { error: ex };
        }
    };

    const deleteData = async (userID, objectID) => {
        //check user status;
        const user = await db.get('users', { '_id': ObjectID(userID) });
        const status = user[0].status;
        try {
            console.log('   inside delete model takeaway');
            //validate objectID;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (valid.length > 0) {
                if (status === 'costumer') {
                    //return if user is a costumer; 
                    return -1;
                } else {
                    //delete only if user is a staff or an admin;
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
        console.log('   inside update model takeaway');
        try {
            //find takeaway using objectID;
            const valid = await db.get(COLLECTION, { '_id': ObjectID(objectID) });
            if (!valid) {
                return null;
            } else {
                //routine if order is to be updated;
                if (data.hasOwnProperty('orders')) {
                    const orders = [];
                    //collect orders existing; 
                    const order = Object.values(valid)[0].orders;
                    for (i = 0; i < order.length; i++) {
                        orders.push(order[i]);
                    }
                    //push new order to be updated;
                    orders.push(data['orders']);
                    //set the new array to be updated;
                    data['orders'] = orders;
                }
                try {
                    const filter = { '_id': ObjectID(objectID) };
                    const updateDoc = { '$set': data };
                    const put = await db.updateData(COLLECTION, filter, updateDoc);
                    return put;
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

    const search = async (search, userID) => {
        console.log('   inside search takeaway');
        //check user status;
        const user = await db.get('users', { '_id': ObjectID(userID) });
        const status = user[0].status;
        if (!search) {
            //return if no item is passed to be searched;
            return null;
        } else {
            //search is not available for costumers;
            if (status === 'costumer') {
                return null;
            } else {
                try {
                    //get takeaway with filter;
                    const filter = { '$text': { '$search': search } };
                    const takeaway = await db.get(COLLECTION, filter);
                    if (takeaway.length === 0) {
                        return null;
                    } else {
                        return takeaway;
                    }
                } catch (ex) {
                    //return if any error occurs when connecting to database;
                    console.log("=== Exception takeaway::get");
                    return { error: ex };
                }
            }
        }
    }


    const lastOrder = async (userID) => {
        console.log('   inside last order takeaway');
        try {
            //find user using userID;
            const valid = await db.get('users', { '_id': ObjectID(userID) });
            if (!valid) {
                return null;
            } else {
                try {
                    const filter = { 'userID': userID };
                    const order = await db.findLastOrder(COLLECTION, filter);
                    if (order.length === 0) {
                        return null;
                    } else {
                        return Object.values(order)[0].orders;
                    }
                } catch (ex) {
                    //return if any error occurs when connecting to database;
                    console.log("=== Exception order::get");
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
        addByStaff,
        addByCostumer,
        deleteData,
        updateData,
        search,
        lastOrder
    }
}