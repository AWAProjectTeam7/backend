const _debugFunctionsController = {
    silentThrowAway: false || process.env.X_DEBUG_HANDLER_SILENT_ABANDON,
    routeHandler: (req, res, next)=>{
        if (process.env.NODE_ENV == "development")
        {
            //allow execution of route
            next();
        }
        else
        {
            //throw the request away
            if (_debugFunctionsController._silentThrowAway)
            {
                //Silently throw the request away, time it out.
            }
            else
            {
                //Either 403 FORBIDDEN or 501 NOT IMPLEMENTED
                res.status(403).send();
            }
        }
    },
    functionHandler: (_debugFunction=()=>{})=>{
        if (process.env.NODE_ENV == "development")
        {
            //allow execution of function
            _debugFunction();
            return true;
        }
        else
        {
            //throw it away
            return false;
        }
    },
    getAppEnvironmentState: (_logStateToConsoleQ=true)=>{
        if (process.env.NODE_ENV == "production") {
            if (_logStateToConsoleQ)
            {
                console.log("Environment: production");
            }
            return "production";
        }
        else
        {
            console.log("Environment: " + process.env.NODE_ENV);
            return process.env.NODE_ENV;
        }
    }
}

module.exports = _debugFunctionsController;