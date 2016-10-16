'use strict';

var constants   = require('../utilities/constants'),
    util        = require('../utilities/common-function'),
    async       = require('async'),
    DAO         = require('../dao/DAO'),
    dbConstants = require('../utilities/dbConstants'),
    md5         = require('MD5'),
    models      = require('../models'),
    log4js      = require('log4js'),
    logger      = log4js.getLogger('[CUSTOMER_CONTROLLER]');

//exports.createSuperAdmin         = function (payload, callback) {
//    async.waterfall([
//            function (cb) {
//                payload.accessToken = (new Buffer(payload.email + new Date()).toString('base64'));
//                payload.password    = md5(payload.password);
//                DAO.save(models.admin, payload, cb);
//            },
//            function (result, cb) {
//                var success = {
//                    response: {
//                        statusCode : constants.STATUS_CODE.CREATED,
//                        message    : constants.responseMessage.ACTION_COMPLETE,
//                        data       : {
//                            _id         : result._id,
//                            accessToken : payload.accessToken
//                        }
//                    },
//                    statusCode: constants.STATUS_CODE.CREATED
//                };
//                cb(null, success);
//            }
//        ],
//        function (error, success) {
//            if (error) {
//                if (error.details.message.indexOf("duplicate") != -1) {
//                    if (error.details.message.indexOf("phoneNumber") != -1) {
//                        error.response = {
//                            statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
//                            message    : constants.responseMessage.PHONE_NUMBER_ALREADY_EXISTS,
//                            data       : {}
//                        };
//                    } else if (error.details.message.indexOf("email") != -1) {
//                        error.response = {
//                            statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
//                            message    : constants.responseMessage.EMAIL_ALREADY_EXISTS,
//                            data       : {}
//                        }
//                    }
//                    error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
//                }
//                return callback(error);
//            }
//            else
//                return callback(null, success);
//        })
//};


exports.createSuperAdmin  = function (payload, callback) {

    console.log("IN.........createSuperAdmin", payload);

    async.waterfall([
            function(cb) {
                var query      = {email : payload.email},
                    projection = {_id: 1, email: 1};

                DAO.findOne(models.superAdmin, query, projection, cb);
            },
            function(preCheckData, cb) {
                if(preCheckData === null) {
                    cb(null, 100);
                } else {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                        message    : constants.responseMessage.EMAIL_ALREADY_EXISTS,
                        data       : {}
                    };
                    error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                    cb(error);
                }
            },
            function(arg1, cb) {
                var query      = {phoneNumber : payload.phoneNumber},
                    projection = {_id: 1, phoneNumber: 1};

                DAO.findOne(models.superAdmin, query, projection, cb);
            },
            function(preCheckData, cb) {
                if(preCheckData === null) {
                    cb(null, 100);
                } else {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                        message    : constants.responseMessage.PHONE_NUMBER_ALREADY_EXISTS,
                        data       : {}
                    };
                    error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                    cb(error);

                }
            },
            function (arg1, cb) {
                payload.accessToken = (new Buffer(payload.email + new Date()).toString('base64'));
                payload.password    = md5(payload.password);
                payload.fullName    = payload.firstName + " " + payload.lastName ;
                DAO.save(models.superAdmin, payload, cb);
            },
            function(saveAdmin, cb) {
                cb(null, saveAdmin);
            },
            function (result, cb) {
                var success = {
                    response: {
                        statusCode : constants.STATUS_CODE.CREATED,
                        message    : constants.responseMessage.ACTION_COMPLETE,
                        data       : {
                            _id         : result._id,
                            accessToken : payload.accessToken,
                            fullName    : payload.fullName
                        }
                    },
                    statusCode: constants.STATUS_CODE.CREATED
                };
                cb(null, success);
            }
        ],
        function (error, success) {
            if (error) {
                return callback(error);
            }
            else
                return callback(null, success);
        })
};
