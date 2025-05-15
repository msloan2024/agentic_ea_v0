const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const sessionSecret = fs.readFileSync('/run/secrets/session_secret', 'utf8').trim();
app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
    })
);

// Flash messages setup
app.use(flash());

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const houndifyRoutes = require('./routes/houndifyRoutes');
const agentRoutes = require('./routes/agentRoutes');

// Middleware to use the routes
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', chatbotRoutes);
app.use('/', dashboardRoutes);
app.use('/', houndifyRoutes);
app.use('/', agentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
