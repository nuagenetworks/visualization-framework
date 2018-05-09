// server.js
var express = require("express");
var path = require("path");
//The below code snippet is only before the time the VSD starts sending api key.
//require('dotenv').load();
process.env['REACT_APP_ELASTICSEARCH_HOST'] = 'http://localhost:9200';
process.env['REACT_APP_VSD_API_ENDPOINT'] = 'https://vsd.com:8443/nuage/api/';
process.env['REACT_APP_GOOGLE_MAP_LAT'] = 37.09024;
process.env['REACT_APP_GOOGLE_MAP_LNG'] = 95.712891;
process.env['REACT_APP_GOOGLE_MAP_ZOOM'] = 4;
process.env['REACT_APP_GOOGLE_MAP_API'] = 'AIzaSyD6gAsFkFAfe0nTGYPUvZuMsmuIxPXnHNI';
process.env['REACT_APP_GOOGLE_MAP_LIBRARIES'] = 'geometry,drawing,places'
//

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
