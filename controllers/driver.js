'use strict';

var constants   = require('../utilities/constants'),
    util        = require('../utilities/common-function'),
    async       = require('async'),
    DAO         = require('../dao/DAO'),
    dbConstants = require('../utilities/dbConstants'),
    md5         = require('MD5'),
    models      = require('../models'),
    log4js      = require('log4js'),
    logger      = log4js.getLogger('[CUSTOMER_CONTROLLER]'),
    _           = require('underscore');



exports.getAppVersion            = function (appVersionFor, deviceType, callback) {
    var query      = {deviceType: deviceType},
        projection = {_id :1, deviceType: 1, version:1,updateMessage: 1, lastCriticalVersion:1};

    async.waterfall([
        function (cb) {
            if(appVersionFor === dbConstants.appVersionFor.CUSTOMER) {
                DAO.findOne(models.customerAppVersion, query, projection, cb);
            } else if(appVersionFor === dbConstants.appVersionFor.DRIVER) {
                DAO.findOne(models.driverAppVersion, query, projection, cb);
            }
        },
        function(appVersionInfo, cb) {
            cb(null, appVersionInfo);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : returnedData
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};

exports.getPartnerList           = function (callback) {
    console.log("IN.....getPartnerList");

    async.waterfall([
        function (cb) {
            var query     = {$and :
                                [
                                    {type      : dbConstants.userType.ADMIN},
                                    {isDeleted : false},
                                    {isBlocked : false}
                                ]
                        },
                projection = {email:1, fullName:1, companyName :1},
                option     = {};
            DAO.find(models.admin, query, projection, option, cb);
        },
        function(partnerData, cb) {
            console.log("I have partner data", partnerData);
            cb(null, partnerData);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : returnedData
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};

exports.registerDriver           = function (payload, callback) {

    console.log("IN====driver", payload);

    var serviceType = _.pluck(payload.service, 'serviceType'),
        vehicleType = _.pluck(payload.vehicle, 'vehicleType'),
        driverDetailData;

    async.waterfall([
        function(cb) {
            var query      = {email: payload.email},
                projection = {_id: 1, email: 1};
            DAO.findOne(models.driver, query, projection, cb);
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
            var query      = {"phone.phoneNumber": payload.phone.phoneNumber},
                projection = {_id: 1, phone: 1};
            DAO.findOne(models.driver, query, projection, cb);
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
        function(arg1, cb) {
            var query      = {vehicleRegistrationNumber : payload.vehicleRegistrationNumber},
                projection = {_id: 1, vehicleRegistrationNumber: 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.EXIST_VEHICLE_REGISTRATION_NO,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function(arg1, cb) {
            var query      = {companyName : payload.companyName},
                projection = {_id: 1, companyName: 1};
            DAO.findOne(models.admin, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.INVALID_COMPANY_NAME,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(arg1, cb) {
            util.generateVericationToken(cb);
        },
        function(verificationToken, cb) {
            console.log("verificationToken", verificationToken);
            payload.verificationToken = verificationToken;
            cb(null, 100);
        },
        function(arg1, cb) {
            //var profilePicture = payload.profilePicture;
            //if (profilePicture && profilePicture.hapi.filename) {
            //    util.uploadProfilePicture(profilePicture, config.s3BucketCredentials.folder.customer, (payload.phoneNumber).replace('+','0'), cb);
            //} else {
            //    cb(null, 100);
            //}
            cb(null, 100);
        },
        function (profileUrl ,cb) {
            var password      = md5(payload.password),
                accessToken   = (new Buffer(payload.firstName + new Date()).toString('base64')),
                fullName      = payload.firstName + " " + payload.lastName;

            payload.accessToken = accessToken;
            payload.fullName    = fullName;
            payload.password    = password;
            payload.serviceType = serviceType;
            payload.vehicleType = vehicleType;
            DAO.save(models.driver, payload, cb);
        },
        function (customerSaved, cb) {
            console.log("Driver successfully saved...", customerSaved);

            var query      = {accessToken : payload.accessToken},
                projection = {
                    accessToken       : 1,
                    appVersion        : 1,
                    fullName          : 1,
                    verificationToken : 1,
                    phone             : 1,
                    isVerified        : 1
                };
            DAO.findOne(models.driver,query, projection, cb);
        },
        function(driverData, cb) {
            driverDetailData = driverData;
            console.log("driverData", driverData);
            var message_body  = 'Welcome to Fastvan. Enter the verification code: ' +payload.verificationToken+ ' in the app to verify yourself!';
            var to_number     =  driverData.phone.prefix + driverData.phone.phoneNumber;
            util.sendMessageFromTwilio(to_number, message_body, cb);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.CREATED,
                message    : constants.responseMessage.REGISTRATION_SUCCESSFUL,
                data       : [{
                    accessToken       : driverDetailData.accessToken,
                    appVersion        : driverDetailData.appVersion,
                    verificationToken : driverDetailData.verificationToken,
                    isVerified        : driverDetailData.isVerified
                }]
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.CREATED};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.resendVerificationToken  = function (payload, callback) {

    console.log("IN ... resendVerificationToken", payload);

    var newVerificationToken,
        driverDetailData;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUser, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {_id: 1, accessToken: 1, phone: 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            driverDetailData = driverData;
            util.generateVericationToken(cb);
        },
        function(verificationToken, cb) {
            newVerificationToken = verificationToken;
            console.log("I have new verification token", verificationToken);

            var query  = {accessToken : payload.accessToken},
                update = {$set : {verificationToken: verificationToken}},
                option = {multi: false};
            DAO.update(models.driver, query, update, option, cb);
        },
        function(updateAccessToken, cb) {
            var message_body  = 'Welcome to Fastvan. Enter the verification code: ' +newVerificationToken+ ' in the app to verify yourself!';
            var to_number     =  driverDetailData.phone.prefix + driverDetailData.phone.phoneNumber;
            util.sendMessageFromTwilio(to_number, message_body, cb);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.RESEND_VERIFICATION_TOKEN,
                data       : [{
                    verificationToken : newVerificationToken
                }]
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })
};

exports.verifySignUp             = function (payload, callback) {

    console.log("IN ... verifySignUp", payload);

    var driverDetialInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUserData, cb) {
            var query      = {$and : [{accessToken: payload.accessToken}, {isVerified : true}]},
                projection = {_id:1, accessToken:1, isVerified:1};

            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverVerifiedData, cb) {
            if(driverVerifiedData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_ALREADY_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            }
        },
        function(authorizedUserData, cb) {
            var query = {$and :
                    [
                        {accessToken: payload.accessToken},
                        {verificationToken : payload.verificationToken}
                    ]
                },
                projection = {
                                _id               : 1,
                                accessToken       : 1,
                                serviceType       : 1,
                                vehicleType       : 1,
                                firstName         : 1,
                                lastName          : 1,
                                fullName          : 1,
                                email             : 1,
                                password          : 1,
                                companyName       : 1,
                                phone             : 1,
                                appVersion        : 1
                            };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            driverDetialInfo = driverData;
            console.log("driverDetialInfo##################", driverDetialInfo);
            if(driverData === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.INVALID_VERIFICATION_TOKEN,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);

            } else {
                cb(null, driverData);
            }
        },
        function(driverData, cb) {
            var query = {$and :
                    [
                        {accessToken       : payload.accessToken},
                        {verificationToken : payload.verificationToken}
                    ]
                },
                update = {$set: {isVerified : true, verificationToken: ''}},
                option = {multi: false};

            DAO.update(models.driver, query, update, option, cb);
        },
        function(driverUpdate, cb) {
            console.log("Driver successfully updated", driverUpdate);
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.VERIFY_DRIVER_SIGN_UP,
                data       : [{
                    accessToken : driverDetialInfo.accessToken,
                    serviceType : driverDetialInfo.serviceType,
                    vehicleType : driverDetialInfo.vehicleType,
                    firstName   : driverDetialInfo.firstName,
                    lastName    : driverDetialInfo.lastName,
                    fullName    : driverDetialInfo.fullName,
                    email       : driverDetialInfo.email,
                    password    : driverDetialInfo.password,
                    companyName : driverDetialInfo.companyName,
                    phone       : driverDetialInfo.phone
                }]
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })
};

exports.driverPhoneLogin         = function (payload, callback) {

    console.log("IN....driverPhoneLogin", payload);

    var driverData,
        accessToken = (new Buffer(payload.phoneNumber + new Date()).toString('base64'));

    async.waterfall([
        function(cb) {
            var query      = {"phone.phoneNumber" : payload.phoneNumber},
                projection = {_id: 1, phone: 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(phonePreCheckData, cb) {
            if(phonePreCheckData === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_EXISTS_PHONE_NO,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(preCheckData, cb) {
            var query      = {$and :
                                    [
                                        {"phone.phoneNumber" : payload.phoneNumber},
                                        {isVerified : true}
                                    ]
                             },
                projection = {_id: 1, phone: 1, isVerified: 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(phonePreCheckData, cb) {
            if(phonePreCheckData === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function (preCheckData, cb) {
            var query       = {$and: [
                    {"phone.phoneNumber" : payload.phoneNumber},
                    {isDeleted : false},
                    {isBlocked : false},
                    {isVerified : true}
                ]
                },
                projection  = {
                                    accessToken  : 1,
                                    serviceType  : 1,
                                    vehicleType  : 1,
                                    firstName    : 1,
                                    lastName     : 1,
                                    fullName     : 1,
                                    email        : 1,
                                    password     : 1,
                                    companyName  : 1,
                                    phone        : 1,
                                    appVersion   : 1
                                };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var encryptedPassword = md5(payload.password);
            var error;
            if(driverData === null) {
                error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.PHONE_LOGIN_ERROR,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            } else if(encryptedPassword !== driverData.password) {
                error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.PHONE_LOGIN_ERROR,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            }
            else {
                var response = {
                    statusCode : constants.STATUS_CODE.OK,
                    message    : constants.responseMessage.LOGIN_SUCCESSFULLY,
                    data       : [{
                        accessToken   : accessToken,
                        serviceType   : driverData.serviceType,
                        vehicleType   : driverData.vehicleType,
                        firstName     : driverData.firstName,
                        lastName      : driverData.lastName,
                        fullName      : driverData.fullName,
                        email         : driverData.email,
                        companyName   : driverData.companyName,
                        phone         : driverData.phone
                    }]
                };
                var success = {response: response, statusCode: constants.STATUS_CODE.OK};
                cb(null, success);
            }
        },
        function(successDriver, cb) {
            driverData = successDriver;
            var query  = {"phone.phoneNumber" : payload.phoneNumber},
                update = {$set :
                                {
                                    accessToken                 : accessToken,
                                    "deviceDetails.deviceName"  : payload.deviceName,
                                    "deviceDetails.deviceToken" : payload.deviceToken,
                                    "addressLatLong.lat"        : payload.addressLatLong.latitude,
                                    "addressLatLong.long"       : payload.addressLatLong.longitude,
                                    isOnline                    : true,
                                    lastLogin                   : new Date(),
                                    modifiedAt                  : new Date()
                                }
                        },
                option = {multi: false};
            DAO.update(models.driver, query, update, option, cb);
        },
        function(updateValue, cb){
            cb(null, driverData);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.driverAccessTokenLogin   = function (payload, callback) {

    console.log("IN ...... driverAccessTokenLogin", payload);

    var driverData,
        accessToken = (new Buffer(payload.deviceName + new Date()).toString('base64'));

    async.waterfall([
        function(cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {_id: 1, accessToken: 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(accessTokenInfo, cb) {
            if(accessTokenInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.INVALID_ACCESS_TOKEN,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.OK;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(preCheckData, cb) {
            var query      = {$and :
                    [
                        {accessToken : payload.accessToken},
                        {isVerified : true}
                    ]
                },
                projection = {_id: 1, accessToken: 1, isVerified: 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(verifiedDriverData, cb) {
            if(verifiedDriverData === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.OK;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(preCheckData, cb) {
            var query       = {$and: [
                    {accessToken : payload.accessToken},
                    {isVerified  : true},
                    {isDeleted   : false},
                    {isBlocked   : false}
                ]
                },
                projection  = {
                    accessToken  : 1,
                    serviceType  : 1,
                    vehicleType  : 1,
                    firstName    : 1,
                    lastName     : 1,
                    fullName     : 1,
                    email        : 1,
                    password     : 1,
                    companyName  : 1,
                    phone        : 1,
                    appVersion   : 1
                };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error;
            if(driverData === null) {
                error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.INVALID_ACCESS,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(null, error);
            }
            else {
                var response = {
                    statusCode : constants.STATUS_CODE.OK,
                    message    : constants.responseMessage.LOGIN_SUCCESSFULLY,
                    data       : [{
                        accessToken   : accessToken,
                        serviceType   : driverData.serviceType,
                        vehicleType   : driverData.vehicleType,
                        firstName     : driverData.firstName,
                        lastName      : driverData.lastName,
                        fullName      : driverData.fullName,
                        email         : driverData.email,
                        companyName   : driverData.companyName,
                        phone         : driverData.phone
                    }]
                };
                var success = {response: response, statusCode: constants.STATUS_CODE.OK};
                cb(null, success);
            }
        },
        function(successDriver, cb) {
            driverData = successDriver;

            var query  = {accessToken : payload.accessToken},
                update = {$set :
                {
                    accessToken                 : accessToken,
                    "deviceDetails.deviceName"  : payload.deviceName,
                    "deviceDetails.deviceToken" : payload.deviceToken,
                    "addressLatLong.latitude"   : payload.addressLatLong.latitude,
                    "addressLatLong.longitude"  : payload.addressLatLong.longitude,
                    isOnline                    : true,
                    lastLogin                   : new Date(),
                    modifiedAt                  : new Date()
                }
                },
                option = {multi: false};
            DAO.update(models.driver, query, update, option, cb);
        },
        function(updateValue, cb){
            cb(null, driverData);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.getDriverInfo            = function (accessToken, callback) {

    console.log("IN ..... getDriverInfo", accessToken);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                                _id         : 1,
                                accessToken : 1,
                                serviceType : 1,
                                vehicleType : 1,
                                firstName   : 1,
                                lastName    : 1,
                                fullName    : 1,
                                email       : 1,
                                companyName : 1,
                                phone       : 1,
                                appVersion  : 1,
                                isVerified  : 1,
                                isDeleted   : 1,
                                isBlocked   : 1
                             };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else  {
                cb(null, driverData);
            }
        },
        function (driverData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : [{
                                accessToken   : driverData.accessToken,
                                serviceType   : driverData.serviceType,
                                vehicleType   : driverData.vehicleType,
                                firstName     : driverData.firstName,
                                lastName      : driverData.lastName,
                                fullName      : driverData.fullName,
                                email         : driverData.email,
                                companyName   : driverData.companyName,
                                appVersion    : driverData.appVersion
                             }]
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.editDriverInfo           = function (payload, callback) {

    console.log("IN ...editDriverInfo", payload);

    var serviceType = _.uniq(_.pluck(payload.service, 'serviceType')),
        vehicleType = _.uniq(_.pluck(payload.vehicle, 'vehicleType'));

    var fullName = payload.firstName + " " + payload.lastName;

    async.waterfall([
        function (cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {_id: 1, accessToken: 1, isVerified: 1, isDeleted : 1, isBlocked :1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(authorizedUser, cb) {
            var query   = {accessToken: payload.accessToken},
                update  = {$set : {
                    firstName                  : payload.firstName,
                    lastName                   : payload.lastName,
                    fullName                   : fullName,
                    serviceType                : serviceType,
                    vehicleType                : vehicleType,
                    "addressLatLong.latitude"  : payload.addressLatLong.latitude,
                    "addressLatLong.longitude" : payload.addressLatLong.longitude,
                     modifiedAt                : new Date()
                }},
                options = {multi: false};
            DAO.update(models.driver, query, update, options, cb);
        },
        function(driverUpdate, cb) {
            console.log("Driver successfully updated....", driverUpdate);
            var query = {accessToken : payload.accessToken},
                projection = {
                                accessToken    : 1,
                                serviceType    : 1,
                                vehicleType    : 1,
                                firstName      : 1,
                                lastName       : 1,
                                fullName       : 1,
                                email          : 1,
                                password       : 1,
                                companyName    : 1,
                                phone          : 1,
                                addressLatLong : 1
                            };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverInfo, cb) {
            cb(null, driverInfo);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.DRIVER_INFO_UPDATE,
                data       : [{
                    accessToken : returnedData.accessToken,
                    serviceType : returnedData.serviceType,
                    vehicleType : returnedData.vehicleType,
                    firstName   : returnedData.firstName,
                    lastName    : returnedData.lastName,
                    fullName    : returnedData.fullName,
                    email       : returnedData.email,
                    companyName : returnedData.companyName,
                    phone       : returnedData.phone
                }]
            };
            success.statusCode = constants.STATUS_CODE.OK;
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.driverForgotPassword     = function (payload, callback) {

    console.log("IN...driverForgotPassword", payload);

    var newPassword,
        driverDetailData;
    async.waterfall([
        function(cb) {
            var query      = {"phone.phoneNumber": payload.phoneNumber},
                projection = {_id: 1, phone: 1, fullName: 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            driverDetailData = driverData;
            if(driverData === null) {
                var error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.PHONE_NO_NOT_EXIST,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(verificationToken, cb) {
            var possible          = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                newPassword       = util.randomString(8, possible);
            var encryptedPassword = md5(newPassword);

            console.log("newPassword ==========", newPassword);
            console.log("encryptedPassword ====", encryptedPassword);

            var query  = {"phone.phoneNumber": payload.phoneNumber},
                update = {$set : {password : encryptedPassword}},
                option = {multi: false};

            DAO.update(models.driver, query, update, option, cb);
        },
        function(updateDriver, cb) {
            var  msg = "It seems you have forgotten your password, Find below new password to login \n\n";
                 msg += "Password: " + newPassword + "\n\n";

            var to_number     =  driverDetailData.phone.prefix + driverDetailData.phone.phoneNumber;
            util.sendMessageFromTwilio(to_number, msg, cb);
        },
        function(twilioMessage, cb) {
            console.log("I have twilio message", twilioMessage);
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.FORGOT_PASSWORD_MESSAGE,
                data       : [{
                    newPassword : newPassword
                }]
            };
            success.statusCode = constants.STATUS_CODE.OK;
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.driverResetPassword      = function (payload, callback) {

    console.log("IN...driverResetPassword", payload);
    var encrypt_old_password = md5(payload.oldPassword);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUserData, cb) {
            var query = {$and :
                                [
                                    {accessToken : payload.accessToken},
                                    {password    : encrypt_old_password}
                                ]
                },
                projection = {
                                _id         : 1,
                                accessToken : 1,
                                password    : 1,
                                isVerified  : 1,
                                isDeleted   : 1,
                                isBlocked   : 1
                            };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error = {};
            if(driverData === null) {

                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.OLD_PASSWORD_NOT_MATCH,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.OK;
                cb(error);
            } else if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.OK;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.OK;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.OK;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(driverData, cb) {
            var encrypt_new_password = md5(payload.newPassword);
            var query  = {$and :
                    [
                        {accessToken : payload.accessToken},
                        {password    : encrypt_old_password}
                    ]
                },
                update = {$set : {password: encrypt_new_password}},
                option = {multi: false};

            DAO.update(models.driver, query, update, option,cb);
        },
        function(updateDriver, cb) {
            console.log("Password successfully updated...", updateDriver);
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.RESET_PASSWORD,
                data       : []
            };
            success.statusCode = constants.STATUS_CODE.OK;
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.driverLogout             = function (payload, callback) {

    console.log("IN ... driverLogout", payload);
    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUser, cb) {
            var query = {$and : [
                                    {accessToken : payload.accessToken},
                                    {isOnline    : false}
                                ]
                        },
                projection = {_id: 1, accessToken: 1, isOnline : 1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.ALREADY_LOGOUT,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            }
        },
        function(driverUpdate, cb) {
            var query  = {accessToken : payload.accessToken},
                update = {$set : {"deviceDetails.deviceToken" : null, isOnline: false}},
                option = {multi : false};
            DAO.update(models.driver, query, update, option, cb);
        },
        function(updateDriverInfo, cb) {
            console.log("Driver info successfully updated", updateDriverInfo);
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.DRIVER_LOGOUT,
                data       : []
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};

exports.getMyBooking             = function (accessToken, callback) {

    console.log("IN ..... getMyBooking", accessToken);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUser, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                                _id         : 1,
                                accessToken : 1,
                                isVerified  : 1,
                                isDeleted   : 1,
                                isBlocked   : 1
                            };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else  {
                cb(null, driverData);
            }
        },
        function(driverInfo, cb) {
            console.log("driverInfo===", driverInfo);
            var query      = {driverId: driverInfo._id},
                projection = {
                                _id                       : 1,
                                customerName              : 1,
                                orderId                   : 1,
                                serviceType               : 1,
                                vehicleType               : 1,
                                scheduledTime             : 1,
                                pickupLocation            : 1,
                                parcelDropLocationDetails : 1,
                                requestStatus             : 1,
                                customerPhoneNo           : 1,
                                serviceAdditionalInfo     : 1,
                                serviceScope              : 1,
                                serviceTime               : 1
                            },
                option    = {};
            DAO.find(models.order, query, projection, option, cb);
        },
        function(orderInfo, cb) {
            console.log("orderInfo #################", orderInfo);

            var countOrderInfo = orderInfo.length;
            if(countOrderInfo === 0) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.NO_AVAILABLE_BOOKING,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function (returnData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : returnData
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.getTodayBooking          = function (accessToken, callback) {

    console.log("IN ....... getTodayBooking", accessToken);

    var moment   = require('moment'),
        today    = moment().startOf('day'),
        tomorrow = moment(today).add(1, 'days');

    console.log("IN ..... getTodayBooking", accessToken);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUser, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isVerified  : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else  {
                cb(null, driverData);
            }
        },
        function(driverInfo, cb) {
            console.log("driverInfo===", driverInfo);
            var query      = {$and :
                                        [
                                            {driverId      : driverInfo._id},
                                            {scheduledTime : {$gte: today}},
                                            {scheduledTime : {$lt: tomorrow}}
                                        ]
                            },
                projection = {
                    _id                       : 1,
                    customerName              : 1,
                    orderId                   : 1,
                    serviceType               : 1,
                    vehicleType               : 1,
                    scheduledTime             : 1,
                    pickupLocation            : 1,
                    parcelDropLocationDetails : 1,
                    requestStatus             : 1,
                    customerPhoneNo           : 1,
                    serviceAdditionalInfo     : 1,
                    serviceScope              : 1,
                    serviceTime               : 1
                },
                option    = {};
            DAO.find(models.order, query, projection, option, cb);
        },
        function(orderInfo, cb) {
            var countOrderInfo = orderInfo.length;
            if(countOrderInfo === 0) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.NO_AVAILABLE_BOOKING,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function (returnData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : returnData
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.getBookingInfo           = function (accessToken, orderId, callback) {

    console.log("IN ....... getTodayBooking");
    console.log("accessToken ===", accessToken);
    console.log("orderId =======", orderId);

    var orderDetailInfo,
        customerDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUser, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isVerified  : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else  {
                cb(null, driverData);
            }
        },
        function(driverInfo, cb) {
            var query      = {orderId : orderId},
                projection = {
                                _id                       : 1,
                                customerId                : 1,
                                orderId                   : 1,
                                serviceType               : 1,
                                vehicleType               : 1,
                                customerName              : 1,
                                scheduledTime             : 1,
                                pickupLocation            : 1,
                                parcelDropLocationDetails : 1,
                                quoteStatus               : 1,
                                requestStatus             : 1,
                                customerPhoneNo           : 1,
                                serviceAdditionalInfo     : 1,
                                serviceScope              : 1,
                                serviceTime               : 1
                            };
            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            orderDetailInfo = orderInfo;
            console.log("orderDetailInfo #############", orderDetailInfo);


            if(orderInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.ORDER_ID_NOT_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            var query      = {_id: orderDetailInfo.customerId},
                projection = {_id: 1, fullName: 1, phone: 1};

            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerInfo, cb) {
            customerDetailInfo = customerInfo;
            console.log("customerDetailInfo =======", customerDetailInfo);
            cb(null, customerDetailInfo);
        },
        function (returnData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : [
                    {
                        _id                       : orderDetailInfo._id,
                        serviceType               : orderDetailInfo.serviceType,
                        customerId                : orderDetailInfo.customerId,
                        orderId                   : orderDetailInfo.orderId,
                        requestStatus             : orderDetailInfo.requestStatus,
                        quoteStatus               : orderDetailInfo.quoteStatus,
                        parcelDropLocationDetails : orderDetailInfo.parcelDropLocationDetails,
                        pickupLocation            : orderDetailInfo.pickupLocation,
                        customerInfo              : customerDetailInfo
                    }
                ]
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })
};

/*
    To check driver is assigned or not
 */


exports.acceptRequestByPartner   = function (payload, callback) {

    console.log("IN...acceptRequestByPartner", payload);

    var driverDetailData;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUserData, cb) {
            driverDetailData = authorizedUserData;
            var query      = {orderId : payload.orderId},
                projection = {
                    _id            : 1,
                    orderId        : 1
                };
            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            if(orderInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.ORDER_ID_NOT_EXISTS,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            var query = {$and:
                                [
                                    {orderId : payload.orderId},
                                    {requestStatus: dbConstants.orderStatus.DRIVER_ACCEPTED}
                                ]
                        },
                projection = {_id: 1, orderId: 1, requestStatus: 1};

            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderPreCheckData, cb) {
            if(orderPreCheckData != null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_ALREADY_ACCEPTED_REQUEST,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(orderInfo, cb) {
            var query      = {$and : [
                    {orderId       : payload.orderId},
                    {driverId      : driverDetailData._id},
                    {requestStatus : dbConstants.orderStatus.DRIVER_ASSIGNED}
                ]
                },
                projection = {
                    _id            : 1,
                    orderId        : 1,
                    driverId       : 1,
                    requestStatus  : 1
                };
            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            if(orderInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_ACCEPTANCE_STATUS,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            if(payload.status === dbConstants.rideRequest.ACCEPT) {
                var query  = {orderId : payload.orderId},
                    update = {$set : {requestStatus: dbConstants.orderStatus.DRIVER_ACCEPTED}},
                    option = {multi : false};

                DAO.update(models.order, query, update, option, cb);
            } else {
                cb(null, 100);
            }
        },
        function(updateOrder, cb) {
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.DRIVER_REQUEST_ACCEPTANCE,
                data       : []
            };
            success.statusCode = constants.STATUS_CODE.OK;
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};

exports.updateDriverLocation     = function (payload, callback) {

    console.log("IN ... updateDriverLocation", payload);

    async.waterfall([
        function (cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {_id: 1, accessToken: 1, isVerified: 1, isDeleted : 1, isBlocked :1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            console.log("driverData ===", driverData);
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(authorizedUser, cb) {
            var query   = {accessToken: payload.accessToken},
                update  = {$set : {
                    "addressLatLong.latitude"  : payload.addressLatLong.latitude,
                    "addressLatLong.longitude" : payload.addressLatLong.longitude,
                    modifiedAt                 : new Date()
                }},
                options = {multi: false};
            DAO.update(models.driver, query, update, options, cb);
        },
        function(driverUpdate, cb) {
            console.log("Driver successfully updated....", driverUpdate);
            var query = {accessToken : payload.accessToken},
                projection = {
                    _id            : 1,
                    addressLatLong : 1
                };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverInfo, cb) {
            cb(null, driverInfo);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.DRIVER_LOCATION_UPDATE,
                data       : returnedData
            };
            success.statusCode = constants.STATUS_CODE.OK;
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

function checkValidRequest(orderId, requestStatus, callback){

    console.log("IN.... checkValidRequest");

    var query      = {},
        projection = {_id: 1,orderId: 1, requestStatus : 1};

    if(requestStatus === dbConstants.orderStatus.REACHED_PICKUP_POINT) {
        query = {$and : [{orderId: orderId}, {requestStatus: dbConstants.orderStatus.DRIVER_ACCEPTED}]};
    } else if(requestStatus === dbConstants.orderStatus.PICKED_UP) {
        query = {$and : [{orderId: orderId}, {requestStatus: dbConstants.orderStatus.REACHED_PICKUP_POINT}]};
    } else if(requestStatus === dbConstants.orderStatus.REACHED_DELIVERY_POINT) {
        query = {$and : [{orderId: orderId}, {requestStatus: dbConstants.orderStatus.PICKED_UP}]};
    } else if(requestStatus === dbConstants.orderStatus.ORDER_DELIVERED) {
        query = {$and : [{orderId: orderId}, {requestStatus: dbConstants.orderStatus.REACHED_DELIVERY_POINT}]};
    }

    async.waterfall([
        function(cb) {
            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            if(orderInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.INVALID_REQUEST_STATUS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            cb(null, orderInfo);
        }
    ],
    function(error, result) {
        if(error) {
            callback(error);
        } else {
            callback(null, result);
        }
    })
};

exports.updateOrderStatus        = function (payload, callback) {

    console.log("IN ... updateOrderStatus", payload);

    var driverDetailInfo,
        orderDetailInfo,
        customMessage;

    async.waterfall([
        function (cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {_id: 1, accessToken: 1, isVerified: 1, isDeleted : 1, isBlocked :1};
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            driverDetailInfo = driverData;
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(driverData, cb) {
            var query      = {orderId : payload.orderId},
                projection = {
                    _id            : 1,
                    orderId        : 1,
                    requestStatus  : 1
                };
            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            orderDetailInfo = orderInfo;
            if(orderInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.ORDER_ID_NOT_EXISTS,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            checkValidRequest(payload.orderId, payload.orderStatus, cb);
        },
        function(validRequest, cb) {
            console.log("validRequest", validRequest);
            if(payload.orderStatus === dbConstants.orderStatus.REACHED_PICKUP_POINT) {
                customMessage = constants.responseMessage.DRIVER_REACHED_PICKUP_POINT;
                cb(null, 100);
            } else if(payload.orderStatus === dbConstants.orderStatus.PICKED_UP) {
                customMessage = constants.responseMessage.DRIVER_PICKED_UP;
                cb(null, 100);
            } else if(payload.orderStatus === dbConstants.orderStatus.REACHED_DELIVERY_POINT) {
                customMessage = constants.responseMessage.DRIVER_REACHED_DELIVERY_POINT;
                cb(null, 100);
            } else if(payload.orderStatus === dbConstants.orderStatus.ORDER_DELIVERED) {
                customMessage = constants.responseMessage.DRIVER_ORDER_DELIVERED;
                cb(null, 100);
            } else {
                cb(null, 100);
            }
        },
        function(validRequest, cb) {
            var query   = {orderId: payload.orderId},
                update  = {$set : {
                                    requestStatus : payload.orderStatus
                           }},
                options = {multi: false};
            DAO.update(models.order, query, update, options, cb);
        },
        function(orderUpdate, cb) {
            console.log("Order status successfully updated....", orderUpdate);
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : customMessage,
                data       : returnedData
            };
            success.statusCode = constants.STATUS_CODE.OK;
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })

};

exports.getNotification          = function (accessToken, callback) {

    console.log("IN ....... getNotification", accessToken);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUser, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isVerified  : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else  {
                cb(null, driverData);
            }
        },
        function(driverInfo, cb) {
            var query      = {$and :
                                        [
                                            {driverId: driverInfo._id},
                                            {isDeleted : false}
                                        ]
                            },
                projection = {
                                orderId   : 1,
                                driverId  : 1,
                                type      : 1,
                                body      : 1,
                                createdAt : 1
                             },
                option     = {};
            DAO.find(models.driverNotification, query, projection, option, cb);
        },
        function(notificationInfo, cb) {
            var countNotificationInfo = notificationInfo.length;
            if(countNotificationInfo === 0) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.NO_AVAILABLE_NOTIFICATION,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, notificationInfo);
            }
        },
        function(notificationInfo, cb) {
            console.log("notificationInfo ======", notificationInfo);
            cb(null, notificationInfo);
        },
        function (returnData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : returnData
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};

exports.clearNotification        = function (payload, callback) {

    console.log("IN...clearNotification", payload);

    var driverDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.DRIVER, cb);
        },
        function(authorizedUser, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isVerified  : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            driverDetailInfo = driverData;

            var error = {};
            if(driverData.isVerified === false) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_NOT_VERIFIED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(driverData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_DRIVER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else  {
                cb(null, driverData);
            }
        },
        function(driverInfo, cb) {
            var query      = {$and : [{driverId : driverInfo._id}, {isDeleted: false}]},
                projection = {_id: 1, driverId: 1, isDeleted: 1},
                option     = {};

            DAO.find(models.driverNotification, query, projection, option, cb);
        },
        function(notificationInfo, cb) {
            console.log("notificationInfo =====", notificationInfo);
            var countNotificationInfo = notificationInfo.length;
            if(countNotificationInfo === 0) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.NOTIFICATION_ALREADY_CLEARED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, notificationInfo);
            }
        },
        function(notificationInfo, cb) {
            var query      = {driverId : driverDetailInfo._id},
                update     = {$set : {isDeleted : true}},
                option     = {multi: true};

            DAO.update(models.driverNotification, query, update, option, cb);
        },
        function(notificationUpdate, cb) {
            console.log("Notification successfully updated", notificationUpdate);
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.CLEAR_NOTIFICATION,
                data       : []
            };
            success.statusCode = constants.STATUS_CODE.OK;
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};





