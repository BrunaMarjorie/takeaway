const db = require('./database')();
const COLLECTION = 'restaurant';
const { ObjectID } = require('mongodb');

module.exports = () => {

    const getWaitingTime = async () => {
        console.log('   inside waiting time');
        try {
            //fetching info from database      
            const time = await db.get(COLLECTION);

            //assigning values to variables;
            const takeaway = Object.values(time)[0].takeawayTime;
            const delivery = Object.values(time)[0].deliveryTime;

            //returning values;
            return { takeaway: takeaway, delivery: delivery };

        } catch (ex) {
            console.log("=== Exception restaurant::getWaitingTime");
            return { error: ex };
        }
    }


    const updateWaitingTime = async (req, res) => {
        console.log('   inside update waiting time');
        //collecting information
        const { takeaway, delivery } = req.body;
        let data = {};

        if (takeaway) {
            data['takeawayTime'] = takeaway;
        }

        if (delivery) {
            data['deliveryTime'] = delivery;
        }

        console.log(data);
        try {
            const filter = { '_id': ObjectID('600826a74ae7335e112a95c5') };
            const updateDoc = { '$set': data };
            const put = await db.updateData(COLLECTION, filter, updateDoc);

            return res.send('Time updated successfully');

        } catch (ex) {
            console.log("=== Exception restaurant::updateWaitingTime");
            return { error: ex };
        }
    }

    return {
        getWaitingTime,
        updateWaitingTime
    }
}