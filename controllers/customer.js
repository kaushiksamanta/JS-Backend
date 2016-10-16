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
    mongoose    = require('mongoose'),
    _           = require('underscore'),
    config      = require('../config/config');

function getService(serviceName, callback) {

    var query      = {name: serviceName},
        options    = {lean: true},
        projections,
        populateVariable;

    if (serviceName === dbConstants.serviceType.REMOVAL) {
        projections      = {materialId: 0, serviceScopeId: 0};
        populateVariable = {path: 'vehicleId additionalServiceId', select: 'name details'};

    } else if (serviceName === dbConstants.serviceType.COURIER) {
        projections      = {serviceScopeId: 1, name: 1, details: 1};
        populateVariable = {path: 'serviceScopeId', select: 'name'};

    } else if (serviceName === dbConstants.serviceType.DELIVERY) {
        projections      = {materialId: 1, name: 1, details: 1};
        populateVariable = {path: 'materialId', select: 'name vehicleId details'};
    }

    async.waterfall([
        function (cb) {
            DAO.getAndPopulateData(models.service, query, projections, options, populateVariable, cb);
        },
        function (serviceInfo, cb) {
            delete serviceInfo[0].__v;

            if(serviceName === dbConstants.serviceType.DELIVERY) {
                DAO.getDataDeepPopulate(models.service, query, projections, options, populateVariable, { path: 'materialId.vehicleId',model: 'vehicle',select: 'name'}, cb);
            } else {
                cb(null, serviceInfo);
            }
        },
        function(serviceInfo, cb) {
            cb(null, serviceInfo);
        }

    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

function getServiceData(callback) {
    var service = {};
    async.waterfall([
            function(cb) {
                getService(dbConstants.serviceType.REMOVAL, cb);
            },
            function(removalData, cb) {
                service.removalData = removalData;
                getService(dbConstants.serviceType.COURIER, cb);
            },
            function(courierData, cb) {
                service.courierData = courierData;
                getService(dbConstants.serviceType.DELIVERY, cb);
            },
            function(deliveryData, cb) {
                service.deliveryData = deliveryData;
                cb(null, service);
            }
        ],
        function(error, result) {
            if(error) {
                callback(error);
            } else {
                callback(null, result);
            }
        });

};

exports.getAppVersion     = function (appVersionFor, deviceType, callback) {
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

exports.registerCustomer  = function (payload, callback) {

    console.log("IN====customer", payload);

    var customerDetailData;

    async.waterfall([
        function(cb) {
            var query      = {email: payload.email},
                projection = {_id: 1, email: 1};
            DAO.findOne(models.customer, query, projection, cb);
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
            DAO.findOne(models.customer, query, projection, cb);
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
            DAO.save(models.customer, payload, cb);
        },
        function (customerSaved, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {
                    accessToken  : 1,
                    fullName     : 1,
                    customerType : 1,
                    firstName    : 1,
                    lastName     : 1,
                    phone        : 1,
                    address      : 1,
                    referralCode : 1,
                    appVersion   : 1,
                    password     : 1
                };
            DAO.findOne(models.customer,query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailData = customerData;
            cb(null, customerData);
        },
        function(customerData, cb) {
            getServiceData(cb);
        },
        function (serviceData, cb) {
            var response = {
                statusCode  : constants.STATUS_CODE.CREATED,
                message    : constants.responseMessage.REGISTRATION_SUCCESSFUL,
                data       : [{
                    accessToken   : customerDetailData.accessToken,
                    fullName      : customerDetailData.fullName,
                    customerType  : customerDetailData.customerType,
                    firstName     : customerDetailData.firstName,
                    lastName      : customerDetailData.lastName,
                    phoneNoPrefix : customerDetailData.prefix,
                    phoneNumber   : customerDetailData.phoneNumber,
                    address       : customerDetailData.address,
                    referralCode  : customerDetailData.referralCode,
                    appVersion    : customerDetailData.appVersion,
                    serviceData   : serviceData
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

exports.loginCustomer     = function (payload, callback) {

    var customerDetailData,
        accessToken        = (new Buffer(payload.email + new Date()).toString('base64'));

    async.waterfall([
        function (cb) {
            var query       = {$and: [
                                        {email     : payload.email},
                                        {isDeleted : false},
                                        {isBlocked : false}
                                    ]
                                },
                projection  = {
                                customerType : 1,
                                firstName    : 1,
                                lastName     : 1,
                                fullName     : 1,
                                referralCode : 1,
                                password     : 1,
                                phone        : 1,
                                address      : 1,
                                accessToken  : 1,
                                appVersion   : 1
                             };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailData = customerData;
            var encryptedPassword = md5(payload.password);
            var error;
            if(customerData === null) {
                console.log("A");
                error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.LOGIN_ERROR,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            } else if(encryptedPassword !== customerData.password) {
                console.log("B");
                error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.LOGIN_ERROR,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            }
            else {
                console.log("C");
                cb(null, customerDetailData);
            }
        },
        function(successCustomer, cb) {
            var query  = {email : payload.email},
                update = {$set :
                            {
                                    accessToken                 : accessToken,
                                    "deviceDetails.deviceName"  : payload.deviceName,
                                    "deviceDetails.deviceToken" : payload.deviceToken,
                                    "addressLatLong.latitude"   : payload.latitude,
                                    "addressLatLong.longitude"  : payload.longitude,
                                     lastLogin                  : new Date(),
                                     modifiedAt                 : new Date()

                            }
                },
                option = {multi: false};
            DAO.update(models.customer, query, update, option, cb);
        },
        function(updateValue, cb) {
            console.log("Customer successfully updated", updateValue);
            getServiceData(cb);
        },
        function(serviceData, cb){
            console.log("customerDetailData.accessToken", customerDetailData.accessToken);
            console.log("accessToken", accessToken);

            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.LOGIN_SUCCESSFULLY,
                data       : [{
                    accessToken   : accessToken,
                    fullName      : customerDetailData.fullName,
                    customerType  : customerDetailData.customerType,
                    firstName     : customerDetailData.firstName,
                    lastName      : customerDetailData.lastName,
                    phoneNoPrefix : customerDetailData.prefix,
                    phoneNumber   : customerDetailData.phoneNumber,
                    address       : customerDetailData.address,
                    referralCode  : customerDetailData.referralCode,
                    appVersion    : customerDetailData.appVersion,
                    serviceData   : serviceData
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

exports.accessTokenLogin  = function (payload, callback) {

    console.log("IN ..... accessTokenLogin", payload);

    var customerDetailData,
        accessToken   = (new Buffer(payload.deviceName + new Date()).toString('base64'));

    async.waterfall([
        function (cb) {
            var query       = {$and: [
                                        {accessToken: payload.accessToken},
                                        {isDeleted  : false},
                                        {isBlocked  : false}
                                     ]
                                },
                projection  = {
                                customerType : 1,
                                firstName    : 1,
                                lastName     : 1,
                                fullName     : 1,
                                referralCode : 1,
                                phone        : 1,
                                address      : 1,
                                accessToken  : 1,
                                appVersion   : 1
                            };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailData = customerData;
            var error;
            if(customerData === null) {
                error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.INVALID_ACCESS,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            }
            else {
                cb(null, customerDetailData);
            }
        },
        function(successCustomer, cb) {
            var query  = {accessToken : payload.accessToken},
                update = {$set :
                {
                    accessToken                 : accessToken,
                    "deviceDetails.deviceName"  : payload.deviceName,
                    "deviceDetails.deviceToken" : payload.deviceToken,
                    "addressLatLong.latitude"   : payload.latitude,
                    "addressLatLong.longitude"  : payload.longitude,
                    lastLogin                   : new Date(),
                    modifiedAt                  : new Date()

                }
                },
                option = {multi: false};
            DAO.update(models.customer, query, update, option, cb);
        },
        function(updateValue, cb){
            getServiceData(cb);
        },
        function(serviceData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.LOGIN_SUCCESSFULLY,
                data       : [{
                    accessToken   : accessToken,
                    fullName      : customerDetailData.fullName,
                    customerType  : customerDetailData.customerType,
                    firstName     : customerDetailData.firstName,
                    lastName      : customerDetailData.lastName,
                    phoneNoPrefix : customerDetailData.prefix,
                    phoneNumber   : customerDetailData.phoneNumber,
                    address       : customerDetailData.address,
                    referralCode  : customerDetailData.referralCode,
                    appVersion    : customerDetailData.appVersion,
                    serviceData   : serviceData
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

exports.getCustomerInfo   = function (accessToken, callback) {
    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(authorizedUserData, cb) {
            var query      = {accessToken: accessToken},
                projection = {
                    customerType : 1,
                    firstName    : 1,
                    lastName     : 1,
                    fullName     : 1,
                    email        : 1,
                    referralCode : 1,
                    phone        : 1,
                    address      : 1,
                    appVersion   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerInfo, cb) {
            var customerData = [{
                customerType  : customerInfo.customerType,
                firstName     : customerInfo.firstName,
                lastName      : customerInfo.lastName,
                fullName      : customerInfo.fullName,
                email         : customerInfo.email,
                referralCode  : customerInfo.referralCode,
                address       : customerInfo.address,
                appVersion    : customerInfo.appVersion,
                phoneNoPrefix : customerInfo.phone.prefix,
                phoneNumber   : customerInfo.phone.phoneNumber
            }];
            cb(null, customerData);
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

exports.editCustomerInfo  = function (payload, callback) {

    console.log("IN ...editCustomerInfo", payload);

    var fullName = payload.firstName + " " + payload.lastName;

    async.waterfall([
        function (cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(authorizedUser, cb) {
            var query   = {accessToken: payload.accessToken},
                 update = {$set : {
                                    firstName                  : payload.firstName,
                                    lastName                   : payload.lastName,
                                    fullName                   : fullName,
                                    address                    : payload.address,
                                    "addressLatLong.latitude"  : payload.addressLatLong.latitude,
                                    "addressLatLong.longitude" : payload.addressLatLong.longitude,
                                    modifiedAt                 : new Date()
                        }},
                options = {multi: false};
            DAO.update(models.customer, query, update, options, cb);
        },
        function(customerUpdate, cb) {
            console.log("Customer info successfully updated", customerUpdate);
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.CUSTOMER_INFO_UPDATE,
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

exports.forgotPassword    = function (payload, callback) {

    console.log("IN ...... forgotPassword");

    var firstName,
        forgot_password_token;

    async.waterfall([
        function(cb) {
            var query      = {email: payload.email},
                projection = {_id: 1, email: 1, firstName:1};
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            if(customerData === null) {
                var error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.EMAIL_NOT_EXISTS,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            } else {
                firstName = customerData.firstName;
                cb(null, 100);
            }
        },
        function(authorizedCustomer, cb) {
                forgot_password_token = md5(payload.email + new Date());
                var query = {email: payload.email},
                update = {$set: {forgotPasswordToken: forgot_password_token}},
                option = {multi: false};
            DAO.update(models.customer, query, update, option, cb);
        },
        function(updateCustomer, cb) {
            var to = payload.email,
                sub = "Forgot Password";
            var msg = "Hi "+firstName+" , \n\n";
            msg += "You seem to have forgotten your password for your account with the email address: " + payload.email + "\n\n";
            msg += "You can click this link to reset your password: " + "http://fastvans.clicklabs.in/reset_password/?token=" + forgot_password_token + "\n\n\n";
            msg += "Thanks. \n\n";
            msg += "The Team FASTVAN. \n";

            util.sendPlainTextEmail(to, msg, sub, function(mailStatus) {
                console.log("mailStatus", mailStatus);
                cb(null, 100);
            });
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.CUSTOMER_RESET_PASSWORD,
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

exports.setForgotPassword = function (payload, callback) {
    var password = md5(payload.password);

    async.waterfall([
        function(cb) {
            var query      = {forgotPasswordToken : payload.forgotPasswordToken},
                projection = {_id: 1, forgotPasswordToken: 1, email:1};
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            if(customerData === null) {
                var error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.INVALID_FORGOT_PASSWORD_TOKEN,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(customerData, cb) {
            var query  = {forgotPasswordToken : payload.forgotPasswordToken},
                update = {$set : {password: password, forgotPasswordToken: ""}},
                option = {multi: false};

            DAO.update(models.customer, query, update, option,cb);
        },
        function(updateCustomer, cb) {
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.SET_PASSWORD,
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

exports.checkValidLink    = function (payload, callback) {

    async.waterfall([
        function(cb) {
            var query      = {forgotPasswordToken : payload.forgotPasswordToken},
                projection = {_id: 1, forgotPasswordToken: 1, email:1};
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            if(customerData === null) {
                var error = {
                    response : {
                        statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                        message    : constants.responseMessage.INVALID_LINK,
                        data       : []
                    },
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED
                };
                cb(error);
            } else {
                cb(null, 100);
            }
        },
        function(updateCustomer, cb) {
            cb(null, 100);
        },
        function(returnedData, cb){
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.VALID_LINK,
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

exports.facebookSignUp    = function (payload, callback) {
    async.waterfall([
        function(cb) {
            var query      = {email: payload.email},
                projection = {_id: 1, email:1, phone:1};
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            if(customerData === null) {
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
                projection = {_id: 1, email:1, phone:1};
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerPhoneData, cb) {
            if(customerPhoneData === null) {
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
            var fbId          = payload.customerFbId,
                fbAccessToken = payload.fbAccessToken;
            util.checkFbUser(fbId, fbAccessToken, cb);
        },
        function(fbAuthorizedUser, cb) {
            cb(null, 100);
        },
        function(arg11,cb) {
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
            DAO.save(models.customer, payload, cb);
        },
        function (customerSaved, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {
                                customerType : 1,
                                firstName    : 1,
                                lastName     : 1,
                                fullName     : 1,
                                email        : 1,
                                phone        : 1,
                                address      : 1,
                                accessToken  : 1,
                                appVersion   : 1
                            };
            DAO.findOne(models.customer,query, projection, cb);
        },
        function(customerData, cb) {
            cb(null, customerData);
        },
        function (customerData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.CREATED,
                message    : constants.responseMessage.REGISTRATION_SUCCESSFUL,
                data       : [{
                    accessToken   : customerData.accessToken,
                    fullName      : customerData.fullName,
                    email         : customerData.email,
                    customerType  : customerData.customerType,
                    firstName     : customerData.firstName,
                    lastName      : customerData.lastName,
                    phoneNoPrefix : customerData.prefix,
                    phoneNumber   : customerData.phoneNumber,
                    address       : customerData.address,
                    referralCode  : customerData.referralCode,
                    appVersion    : customerData.appVersion
                }]
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.CREATED};
            cb(null, success);
        }
    ], function (error, success) {
        if (error) {
            //if(typeof error.details !== "undefined") {
            //    if (error.details.message.indexOf("duplicate") != -1) {
            //        if (error.details.message.indexOf("phoneNumber") != -1) {
            //            error.response = {
            //                statusCode  : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
            //                message     : constants.responseMessage.PHONE_NUMBER_ALREADY_EXISTS,
            //                data        : {}
            //            };
            //        } else if (error.details.message.indexOf("email") != -1) {
            //            error.response = {
            //                statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
            //                message    : constants.responseMessage.EMAIL_ALREADY_EXISTS,
            //                data       : {}
            //            }
            //        }
            //        error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
            //    }
            //}
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};


/*
1. Generate Order Id
2. Get pickup location city - Find all the admin that belongs to those city
3. Rememeber to check same customer id , same schedule date..
4. For order generater just update previous one , not insert.
 */

exports.createBooking     = function (payload, callback) {

    console.log("IN ........ createBooking ", payload);

    var orderGenerator = {},
        customerDetail,
        saveOrderDetail,
        pickupLocationCity,
        adminEmail;

    if(payload.serviceType != dbConstants.serviceType.REMOVAL) {
        delete payload.serviceTime;
    }

    if(payload.serviceType === dbConstants.serviceType.REMOVAL || payload.serviceType === dbConstants.serviceType.DELIVERY) {
        delete payload.serviceScope;
    }

    if(payload.serviceType === dbConstants.serviceType.COURIER) {
        delete payload.vehicleType;
    }

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(authorizedCustomer, cb) {
            var query      = {},
                projection = {_id : 1, currentOrderId: 1};

            DAO.findOne(models.orderGenerator, query, projection, cb);
        },
        function(orderGeneratorData, cb) {
            orderGenerator.currentOrderId = parseInt(orderGeneratorData.currentOrderId) + 1;

            var query  = {currentOrderId : orderGeneratorData.currentOrderId},
                update = {$set : {currentOrderId : parseInt(orderGeneratorData.currentOrderId) + 1}},
                option = {multi: false};

            DAO.update(models.orderGenerator, query, update, option, cb);
        },
        function(orderIdUpdated, cb) {
            var query      = {accessToken: payload.accessToken},
                projection = {
                                customerType : 1,
                                firstName    : 1,
                                lastName     : 1,
                                fullName     : 1,
                                referralCode : 1,
                                phone        : 1
                            };
                DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetail = customerData;
            delete payload.accessToken;
            payload.customerId          = customerDetail._id;
            payload.customerName        = customerDetail.fullName;
            payload.customerPhoneNo     = {
                prefix      : customerDetail.phone.prefix,
                phoneNumber : customerDetail.phone.phoneNumber
            };
            payload.orderId             = orderGenerator.currentOrderId;
            payload.requestStatus       = dbConstants.orderStatus.ORDER_PLACED;
            payload.createdAt           = util.getLocalTimestamp();
            payload.modifiedAt          = util.getLocalTimestamp();

            DAO.save(models.order, payload, cb);
        },
        function(savedOrderData, cb) {
            console.log("Booking successfully created", savedOrderData);
            saveOrderDetail    = savedOrderData;
            pickupLocationCity = savedOrderData.pickupLocation.city;

            var query      = {$and :
                                        [
                                            {"address.city" : pickupLocationCity},
                                            {isDeleted      : false},
                                            {isBlocked      : false}
                                        ]
                             },
                projection = {
                                _id         : 1,
                                email       : 1,
                                companyName : 1
                            },
                options    = {};

            DAO.find(models.admin, query, projection, options, cb);
        },
        function(adminData, cb) {
            adminEmail = _.pluck(adminData, 'email');
            cb(null, adminEmail);
        },
        function(adminEmail, cb) {
            var countAdminEmail = adminEmail.length;
            if(countAdminEmail === 0) {
                cb(null, adminEmail);
            } else {
                var to  = adminEmail,
                    sub = "Order Request";
                var msg = "There is a new order request by customer. The order id is :  "+saveOrderDetail.orderId+" , \n\n";
                msg += "Thanks. \n";

                util.sendPlainTextEmail(to, msg, sub, function(mailStatus) {
                    console.log("mailStatus", mailStatus);
                    cb(null, 100);
                });
            }
        },
        function(returnedData, cb) {
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ORDER_PLACED,
                data       : [{
                    _id         : saveOrderDetail._id,
                    serviceType : saveOrderDetail.serviceType,
                    orderId     : saveOrderDetail.orderId
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

exports.logoutCustomer    = function (customerID, accessToken, cbRoute) {
    async.waterfall([
            function (cb) {
                util.verifyAuthorization(customerID, USER_TYPE, accessToken, cb);
            },
            function (cb) {
                var update = {
                    $pull: {
                        accessToken: {$in: [accessToken]}
                    }
                };
                var options = {limit: 1, lean: true};
                DAO.update(models.customer, {_id: customerID}, update, options, cb);
            }
        ],
        function (error) {


            if (error) {
                cbRoute(error);
            } else {
                var response = {
                    message: constants.responseMessage.LOGOUT_SUCCESSFULLY,
                    data: {}
                };
                var success = {response: response, statusCode: 200};
                cbRoute(null, success);
            }


        }
    )

};

exports.acceptPartnerQuote     = function (payload, callback) {

    console.log("IN ........ acceptPartnerQuote", payload);

    var customerDetailInfo,
        partnerQuoteDetailInfo,
        adminDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(authorizedCustomer, cb) {
            if(payload.acceptStatus != dbConstants.partnerQuote.ACCEPTED) {
                cb(null, authorizedCustomer);
            } else {
                if(!payload._id) {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.BAD_REQUEST,
                        message    : constants.responseMessage.ID_REQUIRED,
                        data       : {}
                    };
                    error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                    cb(error);
                } else {
                    cb(null, authorizedCustomer);
                }
            }
        },
        function(authorizedCustomer, cb) {
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
            var query      = {accessToken : payload.accessToken},
                projection = {_id: 1, accessToken : 1};

            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerInfo, cb) {
            customerDetailInfo = customerInfo;
            var query = {$and :
                                [
                                    {customerId : customerDetailInfo._id},
                                    {orderId    : payload.orderId}
                                ]
                        },
                projection = {_id: 1, customerId : 1, orderId : 1};

            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            if(orderInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_SAME_CUSTOMER_ORDER,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            if(payload._id) {
                util.checkExistsEntity(models.partnerQuote, payload._id, cb);
            } else {
                cb(null, 100);
            }
        },
        function(orderInfo, cb) {
            var query      = {customOrderId : payload.orderId},
                projection = {
                    _id           : 1,
                    adminId       : 1,
                    orderId       : 1,
                    companyName   : 1,
                    customOrderId : 1,
                    quoteValue    : 1,
                    quoteStatus   : 1
                };
            DAO.findOne(models.partnerQuote, query, projection, cb);
        },
        function(partnerQuoteInfo, cb) {
            partnerQuoteDetailInfo = partnerQuoteInfo;
            var query      = {_id: partnerQuoteDetailInfo.adminId},
                projection = {
                    _id         : 1,
                    email       : 1,
                    companyName : 1};

            DAO.findOne(models.admin, query, projection, cb);
        },
        function(adminInfo, cb) {
            adminDetailInfo = adminInfo;
            cb(null, adminDetailInfo);
        },
        function(adminDetailInfo, cb) {
            var query = {$and :
                                [
                                    {customOrderId : payload.orderId},
                                    {quoteStatus   : dbConstants.partnerQuote.ACCEPTED}
                                ]
                },
                projection = {
                    _id         : 1,
                    orderId     : 1,
                    quoteStatus : 1
                };

            DAO.findOne(models.partnerQuote, query, projection, cb);
        },
        function(quoteInfo, cb) {
            if(quoteInfo === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.PARTNER_QUOTE_ALREADY_ACCEPTED,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            }
        },
        function(orderInfo, cb) {
            if(payload.acceptStatus != dbConstants.partnerQuote.ACCEPTED) {
                cb(null, orderInfo);
            } else {
                var query  = {_id : payload._id},
                    update = {$set : {quoteStatus : payload.acceptStatus}},
                    option = {multi : false};
                DAO.update(models.partnerQuote, query, update, option, cb);
            }
        },
        function(partnerQuoteUpdate, cb) {
            var update,
                query  = {orderId: payload.orderId},
                option = {multi: false};

            if(payload.acceptStatus != dbConstants.partnerQuote.ACCEPTED) {
                update = {$set : {requestStatus: dbConstants.orderStatus.QUOTE_IDLE}};
            } else {
                update = {$set : {requestStatus: dbConstants.orderStatus.QUOTE_ACCEPTED}};
            }

            DAO.update(models.order, query, update, option, cb);
        },
        function(OrderUpdate, cb) {
            if(payload.acceptStatus != dbConstants.partnerQuote.ACCEPTED) {
                cb(null, OrderUpdate);
            } else {
                var to  = adminDetailInfo.email,
                    sub = "Quote Accepted";
                var msg = "Your quote is successfully accepted, having order id is :  "+payload.orderId+" , \n\n";
                msg += "Thanks. \n";

                util.sendPlainTextEmail(to, msg, sub, function(mailStatus) {
                    console.log("mailStatus", mailStatus);
                    cb(null, 100);
                });
            }
        },
        function(returnedData, cb) {
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
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

exports.getCustomerBookingInfo = function (accessToken, orderId, callback) {

    console.log("IN ..... getCustomerBookingInfo", accessToken);

    var customerDetailInfo,
        orderDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : accessToken},
                projection = {_id: 1, accessToken: 1, isDeleted : 1, isBlocked :1};
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailInfo = customerData;
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerDetailInfo);
            }
        },
        function(customerInfo, cb) {
            var query      = {orderId : orderId},
                projection = {
                    _id                       : 1,
                    orderId                   : 1,
                    customerId                : 1,
                    serviceType               : 1,
                    vehicleType               : 1,
                    scheduledTime             : 1,
                    pickupLocation            : 1,
                    parcelDropLocationDetails : 1,
                    requestStatus             : 1
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
        function(customerInfo, cb) {
            var query      = {$and :
                                    [
                                        {orderId    : orderId},
                                        {customerId : customerDetailInfo._id}
                                    ]
                             },
                projection = {
                    _id            : 1,
                    orderId        : 1,
                    customerId     : 1
                };
            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            console.log("orderInfo #######", orderInfo);
            if(orderInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CUSTOMER_WITH_DIFFERENT_ORDER,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(authorizedUserData, cb) {
            cb(null, orderDetailInfo);
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

exports.getAllBooking          = function (accessToken, callback) {

    console.log("IN ..... getAllBooking", accessToken);

    var customerDetailInfo,
        orderDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailInfo = customerData;
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerDetailInfo);
            }
        },
        function(customerInfo, cb) {
            var query      = {customerId : customerDetailInfo._id},
                projection = {
                    _id                       : 1,
                    orderId                   : 1,
                    customerId                : 1,
                    serviceType               : 1,
                    vehicleType               : 1,
                    scheduledTime             : 1,
                    pickupLocation            : 1,
                    parcelDropLocationDetails : 1,
                    requestStatus             : 1
                },
                option = {};
            DAO.find(models.order, query, projection, option, cb);
        },
        function(orderInfo, cb) {
            orderDetailInfo = orderInfo;
            var countOrderInfo = orderInfo.length;
            if(countOrderInfo === 0) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.NO_AVAILABLE_BOOKING,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            cb(null, orderInfo);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : orderDetailInfo
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

exports.getDriverLocation   = function (accessToken, driverEmail, callback) {

    console.log("IN ..... getDriverLocation");
    console.log("accessToken =====", accessToken);
    console.log("driverEmail =====", driverEmail);

    var customerDetailInfo,
        driverDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailInfo = customerData;
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerData);
            }
        },
        function(customerData, cb) {
            var query      = {email : driverEmail},
                projection = {
                    email          : 1,
                    addressLatLong : 1
                };

            DAO.findOne(models.driver, query, projection,cb);
        },
        function(driverInfo, cb) {
            driverDetailInfo = driverInfo;
            if(driverInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.EMAIL_NOT_EXISTS,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, driverInfo);
            }
        },
        function(driverInfo, cb) {
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : [{
                    email          : driverDetailInfo.email,
                    addressLatLong : driverDetailInfo.addressLatLong
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

exports.getCustomerNotification = function (accessToken, callback) {

    console.log("IN ..... getCustomerNotification", accessToken);

    var customerDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailInfo = customerData;
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerData);
            }
        },
        function(customerInfo, cb) {
            console.log("customerInfo====", customerInfo);
            var query = {$and:
                                [
                                    {customerId: customerDetailInfo._id},
                                    {isDeleted: false}
                                ]
                        },
                projection = {
                                _id        : 1,
                                orderId    : 1,
                                customerId : 1,
                                type       : 1,
                                body       : 1
                        },
                option = {};
            DAO.find(models.customerNotification, query, projection, option, cb);
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
            console.log("I have notificationInfo", notificationInfo);
            cb(null, notificationInfo);

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

exports.clearCustomerNotification = function (payload, callback) {

    console.log("IN... clearCustomerNotification", payload);

    var customerDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailInfo = customerData;
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerData);
            }
        },
        function(customerData, cb) {
            console.log("############", customerDetailInfo._id);

            var query      = {$and : [{customerId : customerDetailInfo._id}, {isDeleted: false}]},
                projection = {_id: 1, customerId: 1, isDeleted: 1},
                option     = {};

            DAO.find(models.customerNotification, query, projection, option, cb);
        },
        function(notificationInfo, cb) {
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
            var query      = {customerId : customerDetailInfo._id},
                update     = {$set : {isDeleted : true}},
                option     = {multi: true};

            DAO.update(models.customerNotification, query, update, option, cb);
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

exports.getAdminSocialInfo = function (accessToken, callback) {

    console.log("IN ..... getAdminSocialInfo", accessToken);

    var customerDetailInfo;

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            customerDetailInfo = customerData;
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerData);
            }
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : [{
                    facebookId : config.socialInfo.facebookId,
                    twitterId  : config.socialInfo.twitterId,
                    googleId   : config.socialInfo.googleId,
                    contactId  : config.socialInfo.contactId
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

exports.createPayment      = function (payload, callback) {

    console.log("IN ........ createPayment", payload);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(authorizedCustomer, cb) {
            var query = {accessToken: payload.accessToken},
                projection = {_id: 1, accessToken: 1};

            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerInfo, cb) {
            console.log("customerInfo =====", customerInfo);

            var card            = [{
                cardNumber      : "12345678",
                cardHolder      : "Ravi bopara",
                cardExpiryMonth : "11",
                cardExpiryYear  : "2020",
                cardCvv         : "12345"
            }];

            var query           = {accessToken : payload.accessToken},
                update          = {$addToSet   : {cards : card}},
                option          = {multi       : false};

            DAO.update(models.customer, query, update, option, cb);
        },
        function(customerUpdate, cb) {
            console.log("Customer successfully updated", customerUpdate);
            cb(null, 100);
        },
        function(returnedData, cb) {
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.SUCCESS_PAYMENT,
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

exports.getPaymentCredentials = function (accessToken, callback) {

    console.log("IN ..... getPaymentCredentials", accessToken);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerData);
            }
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : [{
                    userId   : config.paymentCredentials.userId,
                    password : config.paymentCredentials.password,
                    entityId : config.paymentCredentials.entityId
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

// To add payment info
exports.addPayment     = function (payload, callback) {

    console.log("IN ........ addPayment", payload);

    async.waterfall([
        function(cb) {
            util.checkAuthorizedUserByAccessToken(payload.accessToken, dbConstants.userType.CUSTOMER, cb);
        },
        function(preCheckData, cb) {
            var query      = {accessToken : payload.accessToken},
                projection = {
                    _id         : 1,
                    accessToken : 1,
                    isDeleted   : 1,
                    isBlocked   : 1
                };
            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerData, cb) {
            var error = {};
            if(customerData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_DELETE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else if(customerData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_CUSTOMER_BLOCK,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, customerData);
            }
        },
        function(customerData, cb) {
            console.log("customerData +++++++", customerData);
            cb(null, 100);
        },
        function(returnedData, cb) {
            var success = {};
            success.response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.SUCCESS_PAYMENT,
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


