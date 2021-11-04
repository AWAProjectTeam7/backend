var fs = require('fs');
function loadModules (_path="./routes/", callback, subSection="none") {
    fs.readdirSync(_path).forEach((file) => {
        let routeName = file.split(".")[0];
        let pathName = _path + routeName;
        let routePath = '/';
        if (subSection != "none")
        {
            routePath += subSection;
            if (subSection[subSection.length-1] != "/")
            {
                routePath += "/";
            }
        }
        if (routeName != "index" && routeName != "root")
        {
            routePath += routeName;
        }
        console.log("Loading route file: " + pathName + " as " + routePath);
        callback({
            name: routePath,
            path: pathName
        });
    });
}
module.exports = loadModules;

/*
---------- Setup in app.js, after "var app = express();" ----------
var routeLoader = require('./autoLoadRoutes');
routeLoader("./routes/", function(route) {
    app.use(route.name, require(route.path));
});

The optional subsection parameter can be used to add additional routing sections, for example:
routeLoader("./routes/", function(route) {}, "v2/webapp"); will result in DOMAIN/v2/webapp/ROUTE


Microsoft Azure does not work with relative paths, so _path should be called as path.join(__dirname, 'FOLDER/')
*/