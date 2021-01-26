const bookings = require('../controller/bookingsController')();
const menu = require('../controller/menuController')();
const takeaway = require('../controller/takeawayController')();
const users = require('../controller/userController')();
const delivery = require('../controller/deliveryController')();
const session = require('./session')();
const restaurant = require('./restaurant')();

module.exports = (function () {

    const routes = require('express').Router(); //create router;

    routes.get('/', (request, response) => { //home page return;
        return response.json({ message: "Home page" });

    });

    //login route; 
    routes.post('/users/register', users.postController);
    routes.post('/users/login', session.loginController);
    routes.post('/users/logout', session.logoutController);
    routes.post('/forgot/password', session.forgotController);
    routes.put('/:email/reset/password', session.forgotController);
    


    //users routes;
    routes.get('/users', session.isAuthenticated, users.getController);
    routes.get('/users/:objectID', session.isAuthenticated, users.getController);
    routes.get('/search/users', session.isAuthenticated, users.searchController);
    routes.delete('/users/:objectID', session.isAuthenticated, users.deleteController);
    routes.put('/users', session.isAuthenticated, users.updateController);
    routes.put('/users/:objectID', session.isAuthenticated, users.updateController);


    //bookings routes;
    routes.get('/bookings', bookings.getController);
    routes.get('/bookings/:date', session.isAuthenticated, bookings.getByDate);
    routes.post('/bookings', bookings.postController);
    routes.delete('/bookings/:objectID', session.isAuthenticated, bookings.deleteController);
    routes.put('/bookings/:objectID', session.isAuthenticated, bookings.updateController);


    //menu routes;
    routes.get('/menu', menu.getController);
    routes.post('/search/menu', menu.searchController);
    routes.post('/menu', session.isAuthenticated, menu.postController);
    routes.delete('/menu/:objectID', session.isAuthenticated, menu.deleteController);
    routes.put('/menu/:objectID', session.isAuthenticated, menu.updateController);


    //takeaway routes;
    routes.get('/takeaway', takeaway.getController);
    routes.get('/takeaway/lastorder', session.isAuthenticated, takeaway.lastOrderController);
    routes.get('/takeaway/:objectID', takeaway.getController);
    routes.get('/search/takeaway', session.isAuthenticated, takeaway.searchController);
    routes.post('/takeaway', takeaway.postController);
    routes.delete('/takeaway/:objectID', session.isAuthenticated, takeaway.deleteController);
    routes.put('/takeaway/:objectID', session.isAuthenticated, takeaway.updateController);


    //delivery routes;
    routes.get('/delivery', delivery.getController);
    routes.get('/delivery/lastorder', session.isAuthenticated, delivery.lastOrderController);
    routes.get('/delivery/:objectID', delivery.getController);
    routes.get('/search/delivery', session.isAuthenticated, delivery.searchController);
    routes.post('/delivery', session.isAuthenticated, delivery.postController);
    routes.delete('/delivery/:objectID', session.isAuthenticated, delivery.deleteController);
    routes.put('/delivery/:objectID', session.isAuthenticated, delivery.updateController);


    //waiting time routes;
    routes.get('/waitingTime', restaurant.getWaitingTime);
    routes.put('/waitingTime', restaurant.updateWaitingTime);


    return routes;

})();