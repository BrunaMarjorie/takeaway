const bookings = require('./controller/bookingsController')();
const menu = require('./controller/menuController')();
const takeaway = require('./controller/takeawayController')();
const users = require('./controller/userController')();

module.exports = (function () {

    const routes = require('express').Router(); //create router;

    routes.get('/', (request, response) => { //home page return;
        return response.json({ message: "Home page" });

    });

    //users routes;
    routes.get('/users', users.getController);
    routes.get('/users/:email', users.getByEmail);
    routes.post('/users', users.postController);
    routes.delete('/users/:objectID', users.deleteController);


    //bookings routes;
    routes.get('/bookings', bookings.getController);
    routes.get('/bookings/:date', bookings.getByDate);
    routes.get('/bookings/:date/:time', bookings.getByDateAndTime);
    routes.post('/bookings', bookings.postController);
    routes.delete('/bookings/:objectID', bookings.deleteController);
    routes.put('/bookings/:objectID', bookings.updateController);

    //menu routes;
    routes.get('/menu', menu.getController);
    routes.get('/menu/:search', menu.searchController);
    routes.post('/menu', menu.postController);
    routes.delete('/menu/:objectID', menu.deleteController);
    routes.put('/menu/:objectID', menu.updateController);

    //takeaway routes;
    routes.get('/takeaway', takeaway.getController);
    routes.post('/takeaway', takeaway.postController);
    routes.delete('/takeaway/:objectID', takeaway.deleteController);
    routes.put('/takeaway/:objectID', takeaway.updateController);

    return routes;

})();