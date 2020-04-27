var express = require('express');
// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;
require("dotenv").config(); 

// Requiring our models for syncing
var db = require('./models');
const session = require("express-session"); 
const SequelizeStore = require("connect-session-sequelize")(session.Store); 

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//to remember user session
app.use(session({
    //CHANGE THIS TO A RANDOM STRING DURING DEVELOPMENT
    secret: process.env.SESSION_SECRET, //|| "yared",
    store: new SequelizeStore({
        db: db.sequelize
    }),
    resave: true,
    saveUninitialized: true,
    cookie: {
        //2 hours
        maxAge: 7200000
    }
}))


// Static directory
app.use(express.static('public'));

const exphbs = require('express-handlebars');

const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
app.engine('handlebars', exphbs({ 
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main' 
}));
app.set('view engine', 'handlebars');

const bracketRoutes = require("./controllers/bracketController");
const userRoutes = require("./controllers/userController");
const htmlRoutes = require("./controllers/htmlController");

app.use(htmlRoutes);
app.use(userRoutes); 

app.use("/api/tournamentbracket",bracketRoutes);

db.sequelize.sync({ force: false }).then(function() {
    app.listen(PORT, function() {
    console.log('App listening on PORT ' + PORT);
    });
});