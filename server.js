var Hapi         = require('hapi'),
    plugins      = require('./plugins'),
    allRoutesAPI = require('./routes/apiRoutes'),
    config       = require('./config/config');


// Create a server with a host and port
/**
 * Server Config
 */
var server = new Hapi.Server({
    connections: {
        routes: {
            cors: {
                origin: ['*'],
                headers: ['X-Requested-With', 'Content-Type']
            }
        }
    }
});


if (process.env.NODE_ENV == 'test') {
    server.connection({
        port: config.server.port.test
    });
} else if(process.env.NODE_ENV == 'staging') {
    server.connection({
        port: config.server.port.staging,
        routes: {
            validate: {
                options: {
                    abortEarly: false
                }
            }
        }
    });
} else {
    server.connection({
        port: config.server.port.dev,
        routes: {
            validate: {
                options: {
                    abortEarly: false
                }
            }
        }
    });
}

/**
 * Plugins
 */
server.register(plugins.pluginsArray, function (err) {
    if (err) {
        throw err;
    }
    /**
     * Start Server
     **/
    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});

// API Routes
var routes = allRoutesAPI.routes;

routes.forEach(function (routeAPI) {
    server.route(routeAPI);
});


// Add the route
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Welcome to fastVan!');
    }
});

// Start the server
server.start(function () {
    console.log('Server running at:', server.info.uri);
});


