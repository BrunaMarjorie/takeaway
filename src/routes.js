const bookings = require('./controller/bookings')();

module.exports= (function(){
    
    const routes = require('express').Router();

    routes.get('/', (request, response) => {
        return response.json({message: "Home page"});
    
    });

    routes.get('/booking', bookings.getController);

    return routes;

})();