

var admin      = require('./admin'),
    bootstrap  = require('./bootstrap'),
    customer   = require('./customer'),
    driver     = require('./driver'),
    service    = require('./service'),
    superAdmin = require('./superAdmin');


module.exports = {
    admin      : admin,
    bootstrap  : bootstrap,
    customer   : customer,
    driver     : driver,
    service    : service,
    superAdmin : superAdmin
};