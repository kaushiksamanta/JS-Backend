var mongoConfig = require('./config/config');

var pack = require('./package'), swaggerOptions = {
        apiVersion: "0.4.7",//pack.version
        pathPrefixSize: 2
    },
    Good = require('good'),
    HapiMongoose = require('hapi-mongoose-db-connector');

var mongoURL;
if (process.env.NODE_ENV == 'test') {
    mongoURL = mongoConfig.db.test;
} else if(process.env.NODE_ENV == 'staging') {
    mongoURL = mongoConfig.db.staging;
}else {
    mongoURL = mongoConfig.db.development;
}
var pluginsArray = [
    {
        register: require('hapi-swagger'),
        options: swaggerOptions
    },
    {
        register: HapiMongoose,
        options: {
            mongodbUrl: mongoURL
        }
    },
    {
        register: Good,
        options: {
            reporters: [{
                reporter: require('good-console'),
                args: [{log: '*', response: '*'}]
            }]
        }
    }
];
exports.pluginsArray = pluginsArray;
