const express = require('express');
//const users = require('./model/users')();
//let userLogged = null;

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = module.exports = express();
const router = require('./routes');

app.use('/', router);

app.use(express.json());

//logging 
app.use((request, response, next) => {
    console.log('[%s] %s -- %s', new Date(), request.method, request.url);
    next();
});

app.use('/', router);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
});


app.use((request, response) => {
    response.status(404).json({
        error: 404,
        message: 'Route not found',
    });
});