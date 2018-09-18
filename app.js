

const express = require('express'); // including express framework to handle http requests
const app = express(); // creating an instance
const bodyParser = require("body-parser"); // body parser  to parse any body input prameters
const blockRoutes = require('./api/routers/block'); // route for block adding and getting
const requestValidationRoutes = require('./api/routers/requestValidation');// route to request a validation 
const MsgsignatureRoutes = require('./api/routers/message-signature');// route to validate user signature
const StarsRoutes = require('./api/routers/stars');// route to look up star(s) by address or hash


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});
app.use('/block', blockRoutes);
app.use('/requestValidation', requestValidationRoutes);
app.use('/message-signature', MsgsignatureRoutes);
app.use('/stars', StarsRoutes);
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
module.exports = app;