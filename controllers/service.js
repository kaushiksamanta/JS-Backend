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


function authorizeSuperAdmin(accessToken, callback) {

    var query      = {$and: [{accessToken: accessToken}, {type: dbConstants.userType.SUPER_ADMIN}]},
        projection = {accessToken: 1, type: 1, email: 1, fullName: 1};

    async.waterfall([
            function (cb) {
                DAO.findOne(models.superAdmin, query, projection, cb);
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

exports.addVehicle              = function (payload, callback) {
    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query = {name: payload.name},
                projection = {_id: 1, name: 1};
            DAO.findOne(models.vehicle, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.VEHICLE_ALREADY_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function (arg1, cb) {
            delete payload.accessToken;
            DAO.save(models.vehicle, payload, cb);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : []
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            //if(typeof error.details !== "undefined") {
            //    if (error.details.message.indexOf("duplicate") != -1) {
            //        if (error.details.message.indexOf("name") != -1) {
            //            error.response = {
            //                statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
            //                message    : constants.responseMessage.VEHICLE_ALREADY_EXISTS,
            //                data       : []
            //            };
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

exports.addAdditionalService    = function (payload, callback) {
    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query      = {name: payload.name},
                projection = {_id: 1, name: 1};
            DAO.findOne(models.additionalService, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.ADDITIONAL_SERVICE_ALREADY_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function (arg1, cb) {
            delete payload.accessToken;
            DAO.save(models.additionalService, payload, cb);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : []
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            //if(typeof error.details !== "undefined") {
            //    if (error.details.message.indexOf("duplicate") != -1) {
            //        if (error.details.message.indexOf("name") != -1) {
            //            error.response = {
            //                statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
            //                message: constants.responseMessage.ADDITIONAL_SERVICE_ALREADY_EXISTS,
            //                data: {}
            //            };
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

exports.addServiceScope         = function (payload, callback) {
    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query      = {name: payload.name},
                projection = {_id: 1, name: 1};
            DAO.findOne(models.serviceScope, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.SERVICE_SCOPE_ALREADY_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function (arg1, cb) {
            delete payload.accessToken;
            DAO.save(models.serviceScope, payload, cb);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : []
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            //if(typeof error.details !== "undefined") {
            //    if (error.details.message.indexOf("duplicate") != -1) {
            //        if (error.details.message.indexOf("name") != -1) {
            //            error.response = {
            //                statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
            //                message    : constants.responseMessage.SERVICE_SCOPE_ALREADY_EXISTS,
            //                data       : {}
            //            };
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

exports.addMaterial             = function (payload, callback) {
    var vehicleId = [],
        query,
        projection,
        van,
        bike;
    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query      = {name: payload.name},
                projection = {_id: 1, name: 1};
            DAO.findOne(models.material, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.MATERIAL_ALREADY_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function (arg1, cb) {
            delete payload.accessToken;
            query = {name: "VAN"};
            projection = {_id: 1, name: 1};
            DAO.findOne(models.vehicle, query, projection, cb);
        },
        function (vanInfo, cb) {
            van = vanInfo;
            query = {name: "BIKE"};
            projection = {_id: 1, name: 1};
            DAO.findOne(models.vehicle, query, projection, cb);
        },
        function (bikeInfo, cb) {
            bike = bikeInfo;

            if (payload.name === dbConstants.materialType.PARCEL) {
                vehicleId.push(van._id);
            } else if (payload.name === dbConstants.materialType.DOCUMENT) {
                vehicleId.push(bike._id);

            } else if (payload.name === dbConstants.materialType.OTHER) {
                vehicleId.push(van._id);
                vehicleId.push(bike._id);
            }
            payload.vehicleId = vehicleId;
            DAO.save(models.material, payload, cb);
        },
        function (saveMaterial, cb) {
            console.log("Material successfully saved", saveMaterial);
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : []
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            //if(typeof error.details !== "undefined") {
            //    if (error.details.message.indexOf("duplicate") != -1) {
            //        if (error.details.message.indexOf("name") != -1) {
            //            error.response = {
            //                statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
            //                message    : constants.responseMessage.MATERIAL_ALREADY_EXISTS,
            //                data       : {}
            //            };
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

exports.addService              = function (payload, callback) {
    var vehicle,
        additionalService,
        serviceScope,
        material,
        removalVehicleInfo;

    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query      = {name: payload.name},
                projection = {_id: 1, name: 1};
            DAO.findOne(models.service, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.SERVICE_ALREADY_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function (arg1, cb) {
            delete payload.accessToken;
            var query = {},
                projection = {_id: 1, name: 1},
                options = {};
            DAO.find(models.vehicle, query, projection, options, cb);
        },
        function (vehicleInfo, cb) {
            vehicle = vehicleInfo;
            var query = {},
                projection = {_id: 1, name: 1},
                options = {};
            DAO.find(models.additionalService, query, projection, options, cb);
        },

        function (additionalServiceInfo, cb) {
            additionalService = additionalServiceInfo;
            var query = {},
                projection = {_id: 1, name: 1},
                options = {};
            DAO.find(models.serviceScope, query, projection, options, cb);
        },
        function (serviceScopeInfo, cb) {
            serviceScope = serviceScopeInfo;
            var query = {},
                projection = {_id: 1, materialType: 1},
                options = {};
            DAO.find(models.material, query, projection, options, cb);
        },
        function (materialInfo, cb) {
            material = materialInfo;
            var removeBike = _.reject(vehicle, function (v) {
                return v.name === dbConstants.vehicleType.BIKE;
            });
            var removeVan = _.reject(removeBike, function (v) {
                return v.name === dbConstants.vehicleType.VAN;
            });
            cb(null, removeVan);
        },
        function (vehicleInfo, cb) {
            removalVehicleInfo = vehicleInfo;
            console.log("#######", payload);

            if (payload.name === dbConstants.serviceType.REMOVAL) {
                var vehicleId = _.pluck(removalVehicleInfo, '_id'),
                    additionalServiceId = _.pluck(additionalService, '_id');

                payload.vehicleId = vehicleId;
                payload.additionalServiceId = additionalServiceId;
            } else if (payload.name === dbConstants.serviceType.COURIER) {
                var serviceScopeId = _.pluck(serviceScope, '_id');

                payload.serviceScopeId = serviceScopeId;
            } else if (payload.name === dbConstants.serviceType.DELIVERY) {
                var materialTypeId = _.pluck(material, '_id');
                payload.materialId = materialTypeId;
            }
            console.log("#######", payload);
            DAO.save(models.service, payload, cb);
        },
        function (saveService, cb) {
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
                data       : []
            };
            var success = {response: response, statusCode: constants.STATUS_CODE.OK};
            cb(null, success);
        }

    ], function (error, success) {
        if (error) {
            //if(typeof error.details !== "undefined") {
            //    if (error.details.message.indexOf("duplicate") != -1) {
            //        if (error.details.message.indexOf("name") != -1) {
            //            error.response = {
            //                statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
            //                message: constants.responseMessage.SERVICE_ALREADY_EXISTS,
            //                data: {}
            //            };
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

exports.getService              = function (accessToken, serviceName, callback) {

    console.log("IN... getService", accessToken, "::", serviceName);


    var query      = {name: serviceName},
        options    = {lean: true},
        projections,
        populateVariable;

    if (serviceName === dbConstants.serviceType.REMOVAL) {
        projections      = {materialId: 0, serviceScopeId: 0};
        populateVariable = {path: 'vehicleId additionalServiceId', select: 'name details'};

    } else if (serviceName === dbConstants.serviceType.COURIER) {
        projections      = {serviceScopeId: 1, name: 1, details:1};
        populateVariable = {path: 'serviceScopeId', select: 'name details'};

    } else if (serviceName === dbConstants.serviceType.DELIVERY) {
        projections      = {materialId: 1, name: 1, details:1};
        populateVariable = {path: 'materialId', select: 'name vehicleId details'};
    }

    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(accessToken, cb);
        },
        function (cb) {
            DAO.getAndPopulateData(models.service, query, projections, options, populateVariable, cb);
        },
        function (serviceInfo, cb) {
            console.log("serviceInfo +++++++", serviceInfo);

            delete serviceInfo[0].__v;

            if(serviceName === dbConstants.serviceType.DELIVERY) {
                DAO.getDataDeepPopulate(models.service, query, projections, options, populateVariable, { path: 'materialId.vehicleId',model: 'vehicle',select: 'name'}, cb);
            } else {
                cb(null, serviceInfo);
            }
        },
        function(serviceInfo, cb) {
            cb(null, serviceInfo);
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

exports.addAppVersion           = function (payload, callback) {
    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function (cb) {
            if(payload.appVersionFor === dbConstants.appVersionFor.CUSTOMER) {
                delete payload.appVersionFor;
                DAO.save(models.customerAppVersion, payload, cb);
            } else if(payload.appVersionFor === dbConstants.appVersionFor.DRIVER) {
                delete payload.appVersionFor;
                DAO.save(models.driverAppVersion, payload, cb);
            }
        },
        function(saveAppVesion, cb) {
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
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

exports.addPromoCode            = function(payload, callback) {
    console.log("IN....addPromoCode", payload);

    async.waterfall([
            function(cb) {
                authorizeSuperAdmin(payload.accessToken, cb);
            },
            function(cb) {
                util.checkValidEndTime(payload.startTime, payload.endTime, cb);
            },
            function(arg1, cb) {
                if(payload.promoType === dbConstants.promoType.CREDIT) {
                    delete payload.discount;
                } else if(payload.promoType === dbConstants.promoType.DISCOUNT) {
                    delete payload.credits;
                }
                cb(null, 100);
            },
            function(vehicleData, cb) {
                DAO.save(models.promo, payload, cb);
            },
            function(promoData, cb) {
                cb(null, 100);
            },
            function(result, cb) {
                var success = {
                    response: {
                        statusCode : constants.STATUS_CODE.OK,
                        message    : constants.responseMessage.ACTION_COMPLETE,
                        data       : {
                            promoCode : payload.promoCode
                        }
                    },
                    statusCode: constants.STATUS_CODE.OK
                };
                cb(null, success);
            }
        ],
        function(error, result) {
            if(error) {
                callback(error);
            } else {
                callback(result);
            }
        });
};

exports.androidPushNotification = function (payload, callback) {

    console.log("IN ..... androidPushNotification", payload);

    var deviceToken = "eFANpW-AyQQ:APA91bHuzunxWX7TS-Tqke4aDx90Qo0TjdWOyUtnn-nfzgwHCTAkFFtC3K6Wl7kSjJnKJ3dkryPVffF5QcyBNWOB-sfRfAgl5sG6MnaUJ4z2x_TWEz2bp8o6mFXOQwV0439hBIRt3teT";

    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var  x = {};
            util.sendAndroidPushNotificationCP(payload.deviceToken, payload.description, payload.notificatioType, x);
            cb(null, 100);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
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

exports.IOSPushNotification     = function (payload, callback) {

    console.log("IN ..... IOSPushNotification", payload);

    var deviceToken = "7de66567cf9e5afff98bec2ef15e0c8b03760c7583c0430df21040fe6342a567";

    async.waterfall([
        function (cb) {
            authorizeSuperAdmin(payload.accessToken, cb);
        },
        function(cb) {
            var query      = {customOrderId : 22},
                projection = {_id: 1, companyName: 1, quoteValue: 1},
                option     = {};

            DAO.findOne(models.partnerQuote, query, projection, cb);
        },
        function(partnerQuoteInfo, cb) {
            console.log("partnerQuoteInfo ===", partnerQuoteInfo);
            util.sendApplePushNotification123(deviceToken, "We have offered the price ...", partnerQuoteInfo, "SENDING_QUOTE");
            cb(null, partnerQuoteInfo);
        },
        function (returnedData, cb) {
            var response = {
                statusCode : constants.STATUS_CODE.OK,
                message    : constants.responseMessage.ACTION_COMPLETE,
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



















