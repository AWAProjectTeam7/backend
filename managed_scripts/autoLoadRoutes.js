var fs = require('fs');
var path = require('path');
let _modulesRootFolderPath= "";

//Module entry point function.
//searchPath should be the /routes/ folder's absolute path in the system.
function loadModules (searchPath="", callback=function(){}) {
    //sets the module's root folder as default
    _modulesRootFolderPath = searchPath;
    //call the recursive search function
    recursiveDirectorySearch(searchPath, callback);
}

function recursiveDirectorySearch(searchPath="", callback=function(){}) {
    //Read all files - including folders - in the searchPath
    fs.readdirSync(searchPath).forEach((element) => {
        //element returns only the file name, append the absolute path here
        let fullRouteFilePath = path.join(searchPath, element);
        //if the path points to a folder, call the function again to search it's contents.
        //this will go through all the files in the given folder, and recursively search all subfolders
        if (fs.statSync(fullRouteFilePath).isDirectory())
        {
            recursiveDirectorySearch(fullRouteFilePath, callback);
        }
        else if (element.split(".")[1] == "js") //the path points to a js file
        {
            //gets the difference between the _modulesRootFolderPath and the absoute file path, this is used
            //as sections in the API URL
            let routeSection = path.relative(_modulesRootFolderPath, fullRouteFilePath).split(".")[0];
            //On windows based systems the path is using the escaped backslashes, replace these with single slashes
            //for to make it compatible with the URL
            if (routeSection.includes("\\"))
            {
                routeSection = routeSection.replace(/[\\\\]/gi, '/');
            }
            element = element.split(".")[0]; //tiny performance and memory save
            //if the file is called "index" or "root", attach it as the default root to the domain; leave empty
            if (element == "index" || element == "root")
            {
                routeSection = "";
            }
            //adds a single slash to start the url
            routeSection = "/" + routeSection;
            console.log("Loading route file: " + fullRouteFilePath + " as " + routeSection);
            //returns the route file information
            //URL           : the URL section that the given file can be reached from
            //modulePath    : the absolute path to the route file, used to load it in
            callback({
                URL: routeSection,
                modulePath: fullRouteFilePath
            });
        }
    });
}
module.exports = loadModules;

/*
---------- Setup in app.js, after "var app = express();" ----------
var routeLoader = require('./autoLoadRoutes');
routeLoader(path.join(__dirname, 'routes/'), function(route) {
    app.use(route.name, require(route.path));
});

Microsoft Azure does not work with relative paths, so searchPath should be called as path.join(__dirname, 'FOLDER/')
*/