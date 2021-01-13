const bookings = require('../controller/bookingsController')();
const menu = require('../controller/menuController')();
const takeaway = require('../controller/takeawayController')();
const users = require('../controller/userController')();
const delivery = require('../controller/deliveryController')();
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
    routes.get('/users/:objectID', session.isAuthenticated, users.getController);
    routes.get('/search/users', session.isAuthenticated, users.searchController);
    routes.delete('/users/:objectID', session.isAuthenticated, users.deleteController);
    routes.put('/users', session.isAuthenticated, users.updateController);
    routes.put('/users/:objectID', session.isAuthenticated, users.updateController);


    //bookings routes;
    routes.get('/bookings', session.isAuthenticated, bookings.getController);
    routes.get('/bookings/:date', session.isAuthenticated, bookings.getByDate);
    routes.post('/bookings', session.isAuthenticated, bookings.postController);
    routes.delete('/bookings/:objectID', session.isAuthenticated, bookings.deleteController);
    routes.put('/bookings/:objectID', session.isAuthenticated, bookings.updateController);


    //menu routes;
    routes.get('/menu', menu.getController);
    routes.get('/search/menu', menu.searchController);
    routes.post('/menu', session.isAuthenticated, menu.postController);
    routes.delete('/menu/:objectID', session.isAuthenticated, menu.deleteController);
    routes.put('/menu/:objectID', session.isAuthenticated, menu.updateController);


    //takeaway routes;
    routes.get('/takeaway', session.isAuthenticated, takeaway.getController);
    routes.get('/takeaway/lastorder', session.isAuthenticated, takeaway.lastOrderController);
    routes.get('/takeaway/:objectID', session.isAuthenticated, takeaway.getController);
    routes.get('/search/takeaway', session.isAuthenticated, takeaway.searchController);
    routes.post('/takeaway', session.isAuthenticated, takeaway.postController);
    routes.delete('/takeaway/:objectID', session.isAuthenticated, takeaway.deleteController);
    routes.put('/takeaway/:objectID', session.isAuthenticated, takeaway.updateController);


    //delivery routes;
    routes.get('/delivery', session.isAuthenticated, delivery.getController);
    routes.get('/delivery/lastorder', session.isAuthenticated, delivery.lastOrderController);
    routes.get('/delivery/:objectID', session.isAuthenticated, delivery.getController);
    routes.get('/search/delivery', session.isAuthenticated, delivery.searchController);
    routes.post('/delivery', session.isAuthenticated, delivery.postController);
    routes.delete('/delivery/:objectID', session.isAuthenticated, delivery.deleteController);
    routes.put('/delivery/:objectID', session.isAuthenticated, delivery.updateController);


    return routes;

})();