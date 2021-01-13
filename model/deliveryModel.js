const { ObjectID } = require('mongodb');
const db = require('../src/database')(); //call database;
const COLLECTION = 'delivery'; //name collection to database;


module.exports = () => {

    const get = async (userID = null, objectID = null) => {
        console.log('   inside model delivery');
        if (userID['status'] !== 'costumer' && objectID === null) {
            //if user is staff or admin, they can access all the deliveries;
            try {
                const query = { 'status': 'open' };
                //select information that can be accessed;
                const project = { 'address': 1 };
                const delivery = await db.find(COLLECTION, query, project);
                if (delivery.length === 0) {
                    return null;
                } else {
                    return delivery;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception delivery::get");
                return { error: ex };
            }

        } else if (userID['status'] !== 'costumer' && objectID !== null) { //routine if objectID is passed;
            //if user is staff or admin, they can access all the takeaways;
            try {
                const query = { '_id': ObjectID(objectID) }; //filter the access;
                //select information that can be accessed;
                const project = {};
                const delivery = await db.find(COLLECTION, query, project);
                console.log('here');
                console.log(delivery);
                if (delivery.length === 0) {
                    return null;
                } else {
                    return delivery;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception delivery::get");
                return { error: ex };
            }
        } else {
            try {
                //if user is a costumer, only their deliveries can be accessed;
                const delivery = await db.get(COLLECTION, { 'userID': userID['id'] });
                if (delivery.length === 0) {
                    return null;
                } else {
                    return delivery;
                }
            } catch (ex) {
                //return if any error occurs when connecting to database;
                console.log("=== Exception delivery::get");
                return { error: ex };
            }
        }
    }

    const addByStaff = async (costumer, date, orders, address, comment, status, time, paid) => {
        console.log('  inside post delivery');
        try {
            const results = await db.add(COLLECTION, {
                costumer: costumer,
                date: date,
                orders: orders,
                address: address,
                comment: comment,
                status: status,
                time: time,
                paid: paid
            });
            return results.result;

        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception delivery model::add");
            return { error: ex };
        }
    };

    const addByCostumer = async (userID, date, orders, comment, status, time, paid) => {
        console.log('  inside post delivery');
        let user;
        let costumer;
        let email;
        let address;
        try {
            //check user id and collect user name;
            user = await db.get('users', { '_id': ObjectID(userID) });
            costumer = user[0].name;
            email = user[0].email; //collect user email to send notification;
            address = user[0].address; //collect user address;
            if (!address) {
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception delivery model::user");
            return { error: ex };
        }
        try {
            const results = await db.add(COLLECTION, {
                userID: userID,
                costumer: costumer,
                date: date,
                orders: orders,
                address: address,
                comment: comment,
                status: status,
                time: time,
                paid: paid
            });
            //return email to send notification;
            return email;
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception delivery model::add");
            return { error: ex };
        }
    };

    const deleteData = async (userID, objectID) => {
        //check user status;
        const user = await db.get('users', { '_id': ObjectID(userID) });
        const status = user[0].status;
        try {
            console.log('   inside delete model delivery');
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
                        console.log("=== Exception delivery model::delete");
                        return { error: ex };
                    }
                }
            } else {
                return null;
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception delivery::delete/find");
            return { error: ex };
        }
    }

    const updateData = async (objectID, data) => {
        console.log('   inside update model delivery');
        try {
            //find delivery using objectID;
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
                    console.log("=== Exception delivery::update");
                    return { error: ex };
                }
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception delivery::update/find");
            return { error: ex };
        }
    }

    const search = async (search, userID) => {
        console.log('   inside search delivery');
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
                    const delivery = await db.get(COLLECTION, filter);
                    if (delivery.length === 0) {
                        return null;
                    } else {
                        return delivery;
                    }
                } catch (ex) {
                    //return if any error occurs when connecting to database;
                    console.log("=== Exception delivery::get");
                    return { error: ex };
                }
            }
        }
    }


    const lastOrder = async (userID) => {
        console.log('   inside last order delivery');
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
            console.log("=== Exception delivery::update/find");
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