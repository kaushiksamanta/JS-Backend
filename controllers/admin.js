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

function authorizeAdmin(accessToken, callback) {
    var query = {$and :
                            [
                                    {accessToken: accessToken},
                                    {$or :
                                            [
                                                {type: dbConstants.userType.ADMIN},
                                                {type: dbConstants.userType.SUPER_ADMIN}
                                            ]
                                    }
                            ]
                },
        projection = {accessToken: 1, type: 1, email: 1, fullName: 1};

    async.waterfall([
            function (cb) {
                DAO.findOne(models.admin, query, projection, cb);
            },
            function (adminInfo, cb) {
                var error = {
                    response: {
                        statusCode : 401,
                        message    : constants.responseMessage.INVALID_ACCESS,
                        data       : {}

                    },
                    statusCode: 401
                };
                if (adminInfo != null) {
                    cb(null);
                } else {
                    cb(error);
                }
            }
        ],
        function (error) {
            if (error) {
                callback(error);
            } else {
                callback(null);
            }
        });
};

exports.createPartner  = function (payload, callback) {

    console.log("IN.. createPartner", payload);

    var serviceType = _.uniq(_.pluck(payload.service, 'serviceType'));

    async.waterfall([
            function(cb) {
                var query      = {email : payload.email},
                    projection = {_id: 1, email: 1};
                DAO.findOne(models.admin, query, projection, cb);
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

                DAO.findOne(models.admin, query, projection, cb);
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
                var query      = {companyName : payload.companyName},
                    projection = {_id: 1, companyName: 1};

                DAO.findOne(models.admin, query, projection, cb);
            },
            function(preCheckData, cb) {
                if(preCheckData === null) {
                    cb(null, 100);
                } else {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                        message    : constants.responseMessage.EXISTS_COMPANY_NAME,
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
                payload.type        = dbConstants.userType.ADMIN;
                payload.serviceType = serviceType;

                delete payload.service;

                DAO.save(models.admin, payload, cb);
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

exports.loginPartner   = function (payload, callback) {

    console.log("IN...loginPartner", payload);

    var adminData,
        accessToken = (new Buffer(payload.email + new Date()).toString('base64'));

    async.waterfall([
        function (cb) {
            var query       = {
                                $and :
                                        [
                                            {email     : payload.email},
                                            {isDeleted : false},
                                            {isBlocked : false}
                                        ]
                              },
                projection  = {
                    _id               : 1,
                    accessToken       : 1,
                    type              : 1,
                    firstName         : 1,
                    lastName          : 1,
                    fullName          : 1,
                    phoneNumberPrefix : 1,
                    phoneNumber       : 1,
                    password          : 1,
                    isDeleted         : 1,
                    isBlocked         : 1
                };
            DAO.findOne(models.admin, query, projection, cb);
        },
        function(adminData, cb) {
            console.log("adminData==", adminData);
            var encryptedPassword = md5(payload.password);
            var error;
            if(adminData === null) {
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
            } else if(encryptedPassword !== adminData.password) {
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
                var response = {
                    statusCode : constants.STATUS_CODE.OK,
                    message    : constants.responseMessage.LOGIN_SUCCESSFULLY,
                    data       : [{
                        accessToken       : accessToken,
                        type              : adminData.type,
                        firstName         : adminData.firstName,
                        lastName          : adminData.lastName,
                        fullName          : adminData.fullName,
                        phoneNumberPrefix : adminData.phoneNumberPrefix,
                        phoneNumber       : adminData.phoneNumber
                    }]
                };
                var success = {response: response, statusCode: constants.STATUS_CODE.OK};
                cb(null, success);
            }
        },
        function(successAdmin, cb) {
            adminData = successAdmin;
            var query  = {email : payload.email},
                update = {$set :
                {
                    accessToken                : accessToken,
                    lastLogin                  : util.getLocalTimestamp(),
                    modifiedAt                 : util.getLocalTimestamp()
                }
                },
                option = {multi: false};
            DAO.update(models.admin, query, update, option, cb);
        },
        function(updateValue, cb){
            console.log("Admin successfully updated ===", updateValue);
            cb(null, adminData);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }

    })

};

exports.getOrderData   = function (accessToken, callback) {

    console.log("IN ..... getOrderData", accessToken);

    var orderDetailData,
        adminCity,
        allOrder;

    async.waterfall([
        function (cb) {
            authorizeAdmin(accessToken, cb);
        },
        function(cb) {
            var query      = {accessToken: accessToken},
                projection = {
                                _id     : 1,
                                type    : 1,
                                address : 1
                             };
            DAO.findOne(models.admin, query, projection, cb);
        },
        function (adminInfoData, cb) {
            adminCity = adminInfoData.address.city;
            var statusQuery = {$or :
                                    [
                                        {requestStatus : dbConstants.orderStatus.PENDING},
                                        {requestStatus : dbConstants.orderStatus.ORDER_PLACED},
                                        {requestStatus : dbConstants.orderStatus.QUOTE_IDLE}
                                    ]
                                },
                query       = {$and :
                                        [
                                            {"pickupLocation.city": adminCity},
                                            {isDeleted : false},
                                            statusQuery
                                        ]
                                },
                projection  = {
                                _id                       : 1,
                                customerId                : 1,
                                orderId                   : 1,
                                serviceType               : 1,
                                vehicleType               : 1,
                                serviceAdditionalInfo     : 1,
                                serviceScope              : 1,
                                serviceTime               : 1,
                                customerName              : 1,
                                quoteStatus               : 1,
                                scheduledTime             : 1,
                                pickupLocation            : 1,
                                parcelDropLocationDetails : 1,
                                requestStatus             : 1,
                                adminAssignedStatus       : 1,
                                isDeleted                 : 1
                };
            DAO.find(models.order, query, projection, cb);
        },
        function(orderData, cb) {
            orderDetailData = orderData;
            var query       = {},
                projection  = {
                    _id                       : 1,
                    customerId                : 1,
                    orderId                   : 1,
                    serviceType               : 1,
                    vehicleType               : 1,
                    serviceAdditionalInfo     : 1,
                    serviceScope              : 1,
                    serviceTime               : 1,
                    customerName              : 1,
                    quoteStatus               : 1,
                    scheduledTime             : 1,
                    pickupLocation            : 1,
                    parcelDropLocationDetails : 1,
                    requestStatus             : 1,
                    adminAssignedStatus       : 1,
                    isDeleted                 : 1
                };
            DAO.find(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            allOrder = orderInfo;
            cb(null, allOrder);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : {
                    newOrder : orderDetailData,
                    allOrder : allOrder
                }
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

exports.acceptQuote    = function (payload, callback) {

    console.log("IN ..... acceptQuote", payload);

    var adminDetailInfo,
        orderDetailInfo,
        customerDetailInfo,
        quoteListDetail;

    //var deviceToken    = "dId3n2YY9YI:APA91bGv5aRSsiWq40juVeYxtArLL_8mRmUNuEgRUH9f0VHhV4KWPtN_xylXBVs7S_AYDAJcRHNgeQVItobuzZr4Tk91cFSD7ZR5J8Bbg3QQbt0CV7A-ZrRrTVicMeXxJv58XTASfODE";
    //var IOSdeviceToken = "7de66567cf9e5afff98bec2ef15e0c8b03760c7583c0430df21040fe6342a567";

    async.waterfall([
        function (cb) {
            authorizeAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query      = {accessToken: payload.accessToken},
                projection = {
                                _id         : 1,
                                accessToken : 1,
                                companyName : 1
                             };

            DAO.findOne(models.admin, query, projection, cb);
        },
        function(adminInfo, cb) {
            adminDetailInfo = adminInfo;
            var query      = {orderId : payload.orderId},
                projection = {
                    _id            : 1,
                    orderId        : 1,
                    customerId     : 1
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
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, orderInfo);
            }
        },
        function(orderInfo, cb) {
            var query = {$and :
                    [
                        {customOrderId : payload.orderId},
                        {quoteStatus   : dbConstants.partnerQuote.ACCEPTED}
                    ]
                },
                projection = {
                    _id           : 1,
                    customOrderId : 1,
                    quoteStatus   : 1
                };

            DAO.findOne(models.partnerQuote, query, projection, cb);
        },
        function(quoteInfo, cb) {
            if(quoteInfo != null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.QUOTE_ALREADY_ACCEPTED,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, quoteInfo);
            }
        },
        function(orderInfo, cb) {
            var query = {$and :
                    [
                        {customOrderId : payload.orderId},
                        {adminId       : adminDetailInfo._id}
                    ]
                },
                projection = {
                    _id           : 1,
                    customOrderId : 1,
                    quoteStatus   : 1
                };

            DAO.findOne(models.partnerQuote, query, projection, cb);
        },
        function(quoteInfo, cb) {
            if(quoteInfo != null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.PARTNER_ALREADY_SEND_QUOTE,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, quoteInfo);
            }
        },
        function(quoteInfo, cb) {
            var quote           = {};
            quote.adminId       = adminDetailInfo._id;
            quote.orderId       = orderDetailInfo._id;
            quote.companyName   = adminDetailInfo.companyName;
            quote.customOrderId = orderDetailInfo.orderId;
            quote.quoteValue    = payload.quoteValue;

            DAO.save(models.partnerQuote, quote, cb);
        },
        function(saveQuote, cb) {
            console.log("Quote successfully saved =======", saveQuote);

            var query      = {customOrderId : payload.orderId},
                projection = {
                    _id           : 1,
                    customOrderId : 1,
                    companyName   : 1,
                    quoteValue    : 1
                },
                option     = {};
            DAO.find(models.partnerQuote, query, projection,option, cb);
        },
        function(partnerQuoteList, cb) {
            quoteListDetail = partnerQuoteList;

            console.log("quoteListDetail ========", quoteListDetail);
            var query      = {_id : orderDetailInfo.customerId},
                projection = {
                    _id           : 1,
                    fullName      : 1,
                    deviceDetails : 1
                };

            DAO.findOne(models.customer, query, projection, cb);
        },
        function(customerInfo, cb) {
            customerDetailInfo = customerInfo;

            console.log("customerInfo ########", customerInfo);

            var deviceType          = customerDetailInfo.deviceDetails.deviceType,
                customerDeviceToken = customerDetailInfo.deviceDetails.deviceToken;

            console.log("deviceType", deviceType);
            console.log("customerDeviceToken", customerDeviceToken);


            if(deviceType === dbConstants.devices.ANDROID) {
                // work for android
                util.sendAndroidPushNotificationCP(customerDeviceToken, "You have received a quote list", "SENDING_QUOTE_LIST", quoteListDetail);
            } else if(deviceType === dbConstants.devices.IOS) {
                // work for IOS
                util.sendApplePushNotification123(customerDeviceToken, "You have received a quote list", quoteListDetail, "SENDING_QUOTE_LIST");
            }
            cb(null, 100);
        },
        function(partnerQuoteInfo, cb) {
            var query  = {orderId : payload.orderId},
                update = {$set : {requestStatus: dbConstants.orderStatus.QUOTE_SEND}},
                option = {multi: false};

            DAO.update(models.order, query, update, option, cb);
        },
        function(orderUpdateInfo, cb) {
            console.log("Order successfully updated ", orderUpdateInfo);

            var notification        = {};
            notification.orderId    = payload.orderId;
            notification.customerId = customerDetailInfo._id;
            notification.type       = dbConstants.notificationType.SENDING_QUOTE;
            notification.body       = "You have received quote";

            DAO.save(models.customerNotification, notification, cb);

        },
        function(saveNotification, cb) {
            console.log("Customer Notification successfully saved", saveNotification);
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.QUOTE_ACCEPTED,
                data       : quoteListDetail
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

//exports.sendQuoteList  = function (payload, callback) {
//
//    console.log("IN ..... sendQuoteList", payload);
//
//    var deviceToken    = "dId3n2YY9YI:APA91bGv5aRSsiWq40juVeYxtArLL_8mRmUNuEgRUH9f0VHhV4KWPtN_xylXBVs7S_AYDAJcRHNgeQVItobuzZr4Tk91cFSD7ZR5J8Bbg3QQbt0CV7A-ZrRrTVicMeXxJv58XTASfODE";
//    var IOSdeviceToken = "7de66567cf9e5afff98bec2ef15e0c8b03760c7583c0430df21040fe6342a567";
//
//    var quoteListDetail,
//        orderDetailInfo,
//        customerDetailInfo;
//
//    async.waterfall([
//        function (cb) {
//            authorizeAdmin(payload.accessToken, cb);
//        },
//        function(cb) {
//            var query      = {orderId : payload.orderId},
//                projection = {
//                                _id        : 1,
//                                orderId    : 1,
//                                customerId : 1
//                             };
//            DAO.findOne(models.order, query, projection, cb);
//        },
//        function(orderInfo, cb) {
//            orderDetailInfo = orderInfo;
//            if(orderInfo === null) {
//                var error = {};
//                error.response = {
//                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
//                    message    : constants.responseMessage.INVALID_ORDER_ID,
//                    data       : {}
//                };
//                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
//                cb(error);
//            } else {
//                cb(null, orderInfo);
//            }
//        },
//        function(orderInfo, cb) {
//            var query      = {customOrderId : payload.orderId},
//                projection = {
//                    _id           : 1,
//                    customOrderId : 1,
//                    companyName   : 1,
//                    quoteValue    : 1
//                },
//                option     = {};
//
//            DAO.find(models.partnerQuote, query, projection,option, cb);
//        },
//        function(partnerQuoteInfo, cb) {
//            quoteListDetail = partnerQuoteInfo;
//            var countPartnerQuoteInfo = partnerQuoteInfo.length;
//            if(countPartnerQuoteInfo === 0) {
//                var error = {};
//                error.response = {
//                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
//                    message    : constants.responseMessage.PARTNER_QUOTE_NOT_ACCEPTED,
//                    data       : {}
//                };
//                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
//                cb(error);
//            } else {
//                cb(null, partnerQuoteInfo);
//            }
//        },
//        function(partnerQuoteInfo, cb) {
//            var query = {$and:
//                                [
//                                    {orderId       : payload.orderId},
//                                    {requestStatus : dbConstants.orderStatus.QUOTE_SEND}
//                                ]
//                        },
//                projection = {_id: 1, orderId: 1, requestStatus: 1};
//
//            DAO.findOne(models.order, query, projection, cb);
//        },
//        function(orderInfo, cb) {
//            if(orderInfo === null) {
//                cb(null, orderInfo);
//            } else {
//                var error = {};
//                error.response = {
//                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
//                    message    : constants.responseMessage.QUOTE_LIST_ALREADY_SEND,
//                    data       : {}
//                };
//                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
//                cb(error);
//            }
//        },
//        function(partnerQuoteInfo, cb) {
//            var query      = {_id : orderDetailInfo.customerId},
//                projection = {
//                                _id           : 1,
//                                fullName      : 1,
//                                deviceDetails : 1
//                             };
//
//            DAO.findOne(models.customer, query, projection, cb);
//        },
//        function(customerInfo, cb) {
//            customerDetailInfo = customerInfo;
//            var deviceType          = customerDetailInfo.deviceDetails.deviceType,
//                customerDeviceToken = customerDetailInfo.deviceDetails.deviceToken;
//
//            if(deviceType === dbConstants.devices.ANDROID) {
//                // work for android
//                util.sendAndroidPushNotificationCP(customerDeviceToken, "You have received a quote list", "SENDING_QUOTE_LIST", quoteListDetail);
//            } else if(deviceType === dbConstants.devices.IOS) {
//                // work for IOS
//                util.sendApplePushNotification123(customerDeviceToken, "You have received a quote list", quoteListDetail, "SENDING_QUOTE_LIST");
//            }
//            cb(null, 100);
//        },
//        function(partnerQuoteInfo, cb) {
//            var query  = {orderId : payload.orderId},
//                update = {$set : {requestStatus: dbConstants.orderStatus.QUOTE_SEND}},
//                option = {multi: false};
//
//            DAO.update(models.order, query, update, option, cb);
//        },
//        function(orderUpdateInfo, cb) {
//            console.log("Order successfully updated ", orderUpdateInfo);
//
//            var notification        = {};
//            notification.orderId    = payload.orderId;
//            notification.customerId = customerDetailInfo._id;
//            notification.type       = dbConstants.notificationType.SENDING_QUOTE;
//            notification.body       = "You have received quote";
//
//            DAO.save(models.customerNotification, notification, cb);
//
//        },
//        function(saveNotification, cb) {
//            console.log("Customer Notification successfully saved", saveNotification);
//            cb(null, 100);
//        },
//        function (returnedData, cb) {
//            var response = {
//                statusCode : constants.STATUS_CODE.OK,
//                message    : constants.responseMessage.SEND_QUOTE_LIST,
//                data       : quoteListDetail
//            };
//            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
//            cb(null, success);
//        }
//    ], function (error, success) {
//        if (error) {
//            return callback(error);
//        } else {
//            return callback(null, success);
//        }
//    })
//};

/*
 1. Fetch the driver ie particularly associated with this
 2. While fetching driver also check service type and vehicle type of the driver according to order id
 */

//exports.sendDriverPushNotification      = function (payload, callback) {
//
//    console.log("IN ..... sendQuote", payload);
//
//    var deviceToken = "fwU9WM67djc:APA91bEoqRdw4hwIa72Ojxzmtmk4ljYkyvmWGJ6c9jyUD2Pi2wSUoAWwqfiR_SuvGsyvbfeU0_d10bW00uiMWG0J7tgRLc8j2rqxyx8vtEQSKIPD7_xNfjcucjPKdb6S4UMB_lkUGuT9";
//
//    var orderDetailInfo,
//        adminDetailInfo,
//        adminCompanyName,
//        driverDetailInfo;
//
//    async.waterfall([
//        function (cb) {
//            authorizeAdmin(payload.accessToken, cb);
//        },
//        function(cb) {
//            var query      = {orderId : payload.orderId},
//                projection = {_id : 1, orderId: 1};
//            DAO.findOne(models.order, query, projection, cb);
//        },
//        function(orderInfo, cb) {
//            if(orderInfo === null) {
//                var error = {};
//                error.response = {
//                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
//                    message    : constants.responseMessage.INVALID_ORDER_ID,
//                    data       : {}
//                };
//                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
//                cb(error);
//            } else {
//                orderDetailInfo = orderInfo;
//                cb(null, orderInfo);
//            }
//        },
//        function(orderInfo, cb) {
//            var query      = {accessToken: payload.accessToken},
//                projection = {_id: 1, accessToken: 1, companyName: 1};
//
//            DAO.findOne(models.admin, query, projection, cb);
//        },
//        function(adminInfo, cb) {
//            adminDetailInfo  = adminInfo;
//            adminCompanyName = adminDetailInfo.companyName;
//
//            console.log("adminCompanyName =====", adminCompanyName);
//
//            var query = {$and :
//                                [
//                                    {companyName : adminCompanyName}
//                                    //{isVerified  : true},
//                                    //{isDeleted   : false},
//                                    //{isBlocked   : false},
//                                    //{isAvailable : true}
//                                ]
//                        },
//                projection = {
//                    _id                       : 1,
//                    companyName               : 1,
//                    serviceType               : 1,
//                    vehicleType               : 1,
//                    email                     : 1
//                },
//                option = {};
//            DAO.find(models.driver, query, projection, option, cb);
//        },
//        function(driverInfo, cb) {
//            driverDetailInfo = driverInfo;
//            console.log("driverDetailInfo", driverDetailInfo);
//
//            var countDriverInfo = driverInfo.length;
//            if(countDriverInfo === 0) {
//                var error = {};
//                error.response = {
//                    statusCode : constants.STATUS_CODE.OK,
//                    message    : constants.responseMessage.NO_AVAILABLE_DRIVER,
//                    data       : {}
//                };
//                error.statusCode = constants.STATUS_CODE.OK;
//                cb(error);
//            } else {
//                var driverEmailArray = _.uniq(_.pluck(driverDetailInfo, 'email'));
//                console.log("driverEmailArray ======", driverEmailArray);
//                cb(null, 100);
//            }
//        },
//        function(preCheckData, cb) {
//            var  x = {};
//            //util.sendAndroidPushNotification(deviceToken, "Whatever the text are...", "NOTIFICATION_TYPE", x);
//            cb(null, 100);
//        },
//        function (returnedData, cb) {
//            var response = {
//                statusCode : constants.STATUS_CODE.OK,
//                message    : constants.responseMessage.ACTION_COMPLETE,
//                data       : returnedData
//            };
//            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
//            cb(null, success);
//        }
//    ], function (error, success) {
//        if (error) {
//            return callback(error);
//        } else {
//            return callback(null, success);
//        }
//
//    })
//};

/*
1. check exists order id.
2. check driver already assigned.
3. check driver email existence.
5. Check admin also belongs to the same city for that order is placed.
4. check driver belongs to admin domain.
5. check driver support the same service for that order offered.
6. check driver support the same vehicle for that order offered.
7. If order type is courier no need to check vehicle is, otherwise check vehicle id
*/

function checkForSameVehicleId(orderId, driverVehicleInfo, callback) {

    console.log("checkForSameVehicleId ==== checkForSameVehicleId");

    async.waterfall([
        function(cb) {
            var query      = {orderId : orderId},
                projection = {orderId : 1, vehicleId: 1};

            DAO.findOne(models.order, query, projection, cb);
        },
        function(orderInfo, cb) {
            var query      = {_id : orderInfo.vehicleId},
                projection = {_id : 1, name: 1};

            DAO.findOne(models.vehicle, query, projection, cb);
        },
        function(vehicleInfo, cb) {
            if(_.indexOf(driverVehicleInfo, vehicleInfo.name) != -1) {
                cb(null, vehicleInfo);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_WITH_DIFFERENT_VEHICLE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            }
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

/*
Check quote is accepted or not using order id and admin id
 */

exports.assignDriver                    = function (payload, callback) {

    console.log("IN ... assignDriver", payload);

    var driverDetailInfo,
        adminDetailInfo,
        orderDetailInfo;

    async.waterfall([
        function(cb) {
            authorizeAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query      = {orderId : payload.orderId},
                projection = {
                                _id            : 1,
                                orderId        : 1,
                                serviceType    : 1,
                                pickupLocation : 1
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
            var query = {$and : [
                                    {accessToken    : payload.accessToken},
                                    {"address.city" : orderDetailInfo.pickupLocation.city}
                                ]
                        },
                projection = {
                                _id         : 1,
                                accessToken : 1,
                                address     : 1,
                                companyName : 1
                            };
            DAO.findOne(models.admin, query, projection, cb);
        },
        function(adminInfo, cb) {
            adminDetailInfo = adminInfo;
            if(adminInfo === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.PARTNER_WITH_DIFFERENT_CITY,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, adminInfo);
            }
        },
        function(adminInfo, cb) {
            var query = {$and :
                                [
                                    {adminId       : adminDetailInfo._id},
                                    {customOrderId : payload.orderId},
                                    {quoteStatus   : dbConstants.partnerQuote.ACCEPTED}
                                ]
                        },
                projection = {
                    _id           : 1,
                    adminId       : 1,
                    customOrderId : 1,
                    quoteStatus   : 1
                };

            DAO.findOne(models.partnerQuote, query, projection, cb);
        },
        function(partnerQuoteInfo, cb) {
            if(partnerQuoteInfo != null) {
                cb(null, partnerQuoteInfo);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.CHECK_QUOTE_ACCEPTANCE,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            }
        },
        function(adminInfo, cb) {
            var query      = {$and :
                                    [
                                        {orderId       : payload.orderId},
                                        {requestStatus : dbConstants.orderStatus.DRIVER_ACCEPTED}
                                    ]
                             },
                projection = {
                                _id           : 1,
                                orderId       : 1,
                                requestStatus : 1
                            };
            DAO.findOne(models.order, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_ALREADY_ACCEPTED_REQUEST,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            }
        },
        function(orderInfo, cb) {
            var query      = {email : payload.driverEmail},
                projection = {
                                _id           : 1,
                                email         : 1,
                                serviceType   : 1,
                                vehicleType   : 1,
                                deviceDetails : 1
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
        function(adminInfo, cb) {
            var query = {$and :
                                [
                                    {email       : payload.driverEmail},
                                    {companyName : adminDetailInfo.companyName}
                                ]
                        },
                projection = {_id :1, email: 1, companyName : 1};

            DAO.findOne(models.driver, query, projection, cb);
        },
        function(driverData, cb) {
            if(driverData === null) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_WITH_DIFFERENT_PARTNER,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            } else {
                cb(null, driverData);
            }
        },
        function(driverData, cb) {
            if(_.indexOf(driverDetailInfo.serviceType, orderDetailInfo.serviceType) != -1) {
                cb(null, driverData);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.BAD_REQUEST,
                    message    : constants.responseMessage.DRIVER_WITH_DIFFERENT_SERVICE,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                cb(error);
            }
        },
        function(driverInfo, cb) {
            // Now check for same vehicle for order as well as driver.......
            if(orderDetailInfo.serviceType === dbConstants.serviceType.COURIER) {
                cb(null, 100);
            } else {
                checkForSameVehicleId(payload.orderId, driverDetailInfo.vehicleType, cb);
            }
        },
        function(sameVehicleInfo, cb) {
            var query  = {orderId : payload.orderId},
                update = {$set : {driverId : driverDetailInfo._id, requestStatus: dbConstants.orderStatus.DRIVER_ASSIGNED}},
                option = {multi: false};

            DAO.update(models.order, query, update, option, cb);
        },
        function(updateOrder, cb) {
            console.log("Order successfully updated =======", updateOrder);
            var driverNotification      = {};
            driverNotification.orderId  = payload.orderId;
            driverNotification.driverId = driverDetailInfo._id;
            driverNotification.type     = dbConstants.driverNotificationType.ORDER_REQUEST;
            driverNotification.body     = "To accept ride";

            DAO.save(models.driverNotification, driverNotification, cb);
        },
        function(saveNotification, cb) {
            console.log("Driver notification successfully saved ====", saveNotification);

            console.log("deviceType", driverDetailInfo.deviceDetails.deviceType);
            console.log("deviceToken", driverDetailInfo.deviceDetails.deviceToken);

            var deviceType  = driverDetailInfo.deviceDetails.deviceType;
            var deviceToken = "dId3n2YY9YI:APA91bGv5aRSsiWq40juVeYxtArLL_8mRmUNuEgRUH9f0VHhV4KWPtN_xylXBVs7S_AYDAJcRHNgeQVItobuzZr4Tk91cFSD7ZR5J8Bbg3QQbt0CV7A-ZrRrTVicMeXxJv58XTASfODE";
            var x = {};
            x.orderId = payload.orderId;
            if(deviceType === dbConstants.devices.ANDROID) {
                console.log("push notification for ANDROID :::");
                util.sendAndroidPushNotification(driverDetailInfo.deviceDetails.deviceToken, "To accept ride", payload.notificatioType, x);
                cb(null, 100);
            } else {
                // To send push notification for IOS.
                console.log("push notification for IOS :::");
                cb(null, 100);
            }
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ASSIGN_DRIVER,
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

exports.getMyDriver   = function (accessToken, callback) {

    console.log("IN ..... getMyDriver", accessToken);

    var adminDetailInfo;

    async.waterfall([
        function (cb) {
            authorizeAdmin(accessToken, cb);
        },
        function(cb) {
            var query      = {accessToken: accessToken},
                projection = {
                    _id         : 1,
                    companyName : 1
                };
            DAO.findOne(models.admin, query, projection, cb);
        },
        function(adminInfo, cb) {
            adminDetailInfo = adminInfo;
            var query      = {$and :
                                    [
                                        {companyName: adminDetailInfo.companyName},
                                        {isDeleted: false},
                                        {isBlocked: false}
                                    ]
                            },
                projection = {
                                _id         : 1,
                                serviceType : 1,
                                vehicleType : 1,
                                fullName    : 1,
                                email       : 1
                            },
                option     = {};

            DAO.find(models.driver, query, projection, option, cb);
        },
        function(driverInfo, cb) {
            console.log("driverInfo", driverInfo);
            var countDriverInfo = driverInfo.length;
            if(countDriverInfo === 0) {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.OK,
                    message    : constants.responseMessage.NO_AVAILABLE_DATA,
                    data       : {}
                };
                error.statusCode = constants.STATUS_CODE.OK;
                cb(error);
            } else {
                cb(null, driverInfo);
            }

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










