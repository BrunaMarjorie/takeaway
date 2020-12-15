const bookings = require('./controller/bookings')();

module.exports= (function(){
    
    const routes = require('express').Router(); //create router;

    routes.get('/', (request, response) => { //home page return;
        return response.json({message: "Home page"});
    
    });

    //bookings returns;
    routes.get('/bookings', bookings.getController);
    routes.get('/bookings/:date', bookings.getByDate);
    routes.get('/bookings/:date/:time', bookings.getByDateAndTime);
    routes.post('/bookings', bookings.postController);
    routes.delete('/bookings/:objectID', bookings.deleteController);
    routes.put('/bookings/:objectID', bookings.updateController);

    return routes;

})();