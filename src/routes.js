const bookings = require('./controller/bookingsController')();
const menu = require('./controller/menuController')();
const takeaway = require('./controller/takeawayController')();
const users = require('./controller/userController')();
const session = require('./session')();

module.exports = (function () {

    const routes = require('express').Router(); //create router;

    routes.get('/', (request, response) => { //home page return;
        return response.json({ message: "Home page" });

    });

    //login route; 
    routes.post('/users/register', users.postController);
    routes.post('/users/login', session.loginController);
    routes.post('/users/logout', session.logoutController);


    //users routes;
    routes.get('/users', session.isAuthenticated, users.getController);
    routes.get('/users/:email', users.getByEmail);
    routes.delete('/users/:objectID', users.deleteController);
    routes.put('/users/:objectID', users.updateController);


    //bookings routes;
    routes.get('/bookings', bookings.getController);
    routes.get('/bookings/:date', bookings.getByDate);
    routes.get('/bookings/:date/:time', bookings.getByDateAndTime);
    routes.post('/bookings', session.isAuthenticated, bookings.postController);
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