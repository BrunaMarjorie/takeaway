const { ObjectID } = require('mongodb');
const db = require('../src/database')(); //call database;
const COLLECTION = 'takeaway'; //name collection to database;
const validations = require('../src/validations')();
const restaurant = require('../src/restaurant')();



module.exports = () => {

    const get = async (userID = null, objectID = null) => {
        console.log('   inside model takeaway');
        if ((userID['status'] === 'admin' || userID['status'] === 'staff')
            && objectID === null) {
            //if user is staff or admin, they can access all the takeaways;
            try {
                const query = {'status': 'open'}; //filter the access;
                //select information that can be accessed;
                const project = { 'customer': 1, 'time': 1, 'paid': 1 };
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
                //if user is a customer, only their takeaways can be accessed;
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

    const addByStaff = async (userID, name, phoneNumber, date, order, comment, status, time, paid) => {
        console.log('  inside post takeaway');
        let total;
        let orders = [];
        //validate entries;
        if (!name) {
            return { error: 'Customer name is missing.' };
        }
        if (!phoneNumber) {
            return { error: 'Phone number is missing.' };
        }
        if (!date) {
            date = new Date();
        }
        if (!order) {
            return { error: 'Order is missing.' }; //return if no order is informed;
        } else {
            const valid = await validations.orderValidation(order, userID);
            if (valid == -1) {
                //return if no order is not valid;
                return {error: 'Order must have pairs of dish and quantity'};
            } else if (valid == null) {
                //return if objectID is not valid;
                return {error: 'ObjectID is not valid.'};
            } else {
                //return order with final price;
                orders = valid.orders;
                total = parseFloat(valid.total).toFixed(2);
            }
        }
        if (!comment) {
            comment = 'no comments'; //set comment default;
        }
        if (!status) {
            status = "open"; //set status default;
        }
        if (!time) {
            //set time default;
            const { takeaway } = await restaurant.getWaitingTime();
            time = takeaway;
        }
        if (!paid) {
            paid = 'not paid'; //set paid default;
        }
        try {
            const results = await db.add(COLLECTION, {
                customer: name,
                phoneNumber: phoneNumber,
                date: date,
                orders: orders,
                total: total,
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

    const addByCustomer = async (userID, date, order, comment, status, time, paid) => {
        console.log('  inside this post takeaway');
        let total;
        let user;
        let customer;
        let email;
        let orders = [];
        //validate entries;
        if (!date) {
            date = new Date();
        }
        if (!order) {
            return { error: 'Order is missing.' }; //return if no order is informed;
        } else {
            const valid = await validations.orderValidation(order, userID);
            if (valid == -1) {
                //return if no order is not valid;
                return {error: 'Order must have pairs of dish and quantity'};
            } else if (valid == null) {
                //return if objectID is not valid;
                return {error: 'ObjectID is not valid.'};
            } else {
                //return order with final price;
                orders = valid.orders;
                total = parseFloat(valid.total).toFixed(2);
            }
        }
        if (!comment) {
            comment = 'no comments'; //set comment default;
        }
        if (!status) {
            status = "open"; //set status default;
        }
        if (!time) {
            //set time default;
            const { takeaway } = await restaurant.getWaitingTime();
            time = takeaway;
        }
        if (!paid) {
            paid = 'not paid'; //set paid default;
        }
        try {
            //check user id and collect user name;
            user = await db.get('users', { '_id': ObjectID(userID) });
            customer = user[0].name;
            email = user[0].email; //collect user email to send notification;
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway model::user");
            return { error: ex };
        }
        try {
            const results = await db.add(COLLECTION, {
                userID: userID,
                customer: customer,
                date: date,
                orders: orders,
                total: total,
                comment: comment,
                status: status,
                time: time,
                paid: paid
            });
            //return email to send notification;
            return {results: email};
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
                if (status === 'customer') {
                    //return if user is a customer; 
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
            //search is not available for customers;
            if (status === 'customer') {
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
                    console.log(order);
                    if (order.length === 0) {
                        return null;
                    } else {
                        const lastOrder = Object.values(order)[0].orders;
                        const total = Object.values(order)[0].total;
                        return {order: lastOrder, total: total};
                    }
                } catch (ex) {
                    //return if any error occurs when connecting to database;
                    console.log("=== Exception order::get");
                    return { error: ex };
                }
            }
        } catch (ex) {
            //return if any error occurs when connecting to database;
            console.log("=== Exception takeaway::lastOrder");
            return { error: ex };
        }
    }


    return {
        get,
        addByStaff,
        addByCustomer,
        deleteData,
        updateData,
        search,
        lastOrder
    }
}