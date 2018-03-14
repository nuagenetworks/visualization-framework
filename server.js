// server.js
var express = require("express");
var path = require("path");
require('dotenv').load();
var app = express();

var homepage = "/reports"; // Quickly edit this line to test the build

var homepageFolder = homepage.substring(1, homepage.length);

// serve our static stuff like index.css
app.use(homepage + "/static", express.static(path.join(__dirname, homepageFolder, "static")));
app.use(homepage + "/configurations", express.static(path.join(__dirname, homepageFolder, "configurations")));
app.use(homepage + "/css", express.static(path.join(__dirname, homepageFolder, "css")));
app.use(homepage + "/fonts", express.static(path.join(__dirname, homepageFolder, "fonts")));
app.use(homepage + "/icons", express.static(path.join(__dirname, homepageFolder, "icons")));
app.use(homepage + "/js", express.static(path.join(__dirname, homepageFolder, "js")));

// send all requests to index.html so browserHistory in React Router works
app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, homepageFolder, "index.html"));
});

var PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
    console.log("Production Express server running at localhost:" + PORT);
});
