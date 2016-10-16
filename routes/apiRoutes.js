var admin      = require('./admin'),
    customer   = require('./customer'),
    driver     = require('./driver'),
    service    = require('./service'),
    superAdmin = require('./superAdmin');

var routes = [
    admin,
    customer,
    driver,
    service,
    superAdmin
];

module.exports.routes = routes;