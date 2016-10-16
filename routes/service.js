
var Joi              = require('joi'),
    controller       = require('../controllers'),
    commonFunction   = require('../utilities/common-function.js'),
    dbConstants      = require('../utilities/dbConstants'),
    currentLocalTime = commonFunction.getLocalTimestamp();

var addVehicle              = {
    method : 'POST',
    path   : '/api/service/addVehicle',
    config : {
        description : 'NOT FOR TESTING',
        tags        : ['api', 'vehicle'],
        handler     : function (request, reply) {
            controller.service.addVehicle(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken    : Joi.string().required(),
                name           : Joi.string().required().valid(
                                                                dbConstants.vehicleType.VAN,
                                                                dbConstants.vehicleType.BIKE,
                                                                dbConstants.vehicleType.THREE_TON_TRUCK,
                                                                dbConstants.vehicleType.FIVE_TON_TRUCK,
                                                                dbConstants.vehicleType.EIGHT_TON_TRUCK
                                                            ),
                details        : Joi.string().required()
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var addAdditionalService    = {
    method : 'POST',
    path   : '/api/service/addAdditionalService',
    config : {
        description: 'NOT FOR TESTING',
        tags: ['api', 'additionalService'],
        handler: function (request, reply) {
            controller.service.addAdditionalService(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken : Joi.string().required(),
                name        : Joi.string().required().valid(
                                                            dbConstants.additionalServiceType.EXPRESS_DELIVERY,
                                                            dbConstants.additionalServiceType.ENGLISH_SPEAKING_DRIVER
                                                        ),

                cost        : Joi.number().required()
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var addServiceScope         = {
    method : 'POST',
    path   : '/api/service/addServiceScope',
    config : {
        description: 'NOT FOR TESTING',
        tags: ['api', 'service', 'scope'],
        handler: function (request, reply) {
            controller.service.addServiceScope(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken : Joi.string().required(),
                name        : Joi.string().required().valid(
                                                                dbConstants.serviceScope.NATIONAL,
                                                                dbConstants.serviceScope.INTERNATIONAL
                                                            )
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var addMaterial             = {
    method : 'POST',
    path   : '/api/service/addMaterial',
    config : {
        description: 'NOT FOR TESTING',
        tags: ['api', 'service', 'material'],
        handler: function (request, reply) {
            controller.service.addMaterial(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken : Joi.string().required(),
                name        : Joi.string().required().valid(
                                                            dbConstants.materialType.PARCEL,
                                                            dbConstants.materialType.DOCUMENT,
                                                            dbConstants.materialType.OTHER

                                                        ),
                details     : Joi.string().required()
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var addService              = {
    method : 'POST',
    path   : '/api/service/addService',
    config : {
        description: 'NOT FOR TESTING',
        tags: ['api', 'service', 'serviceInfo'],
        handler: function (request, reply) {
            controller.service.addService(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken : Joi.string().required(),
                name        : Joi.string().required().valid(
                                                                dbConstants.serviceType.COURIER,
                                                                dbConstants.serviceType.REMOVAL,
                                                                dbConstants.serviceType.DELIVERY
                                                            ),
                details     : Joi.string().required()
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var getService              = {
    method : 'GET',
    path   : '/api/service/getService/{accessToken}/serviceName/{serviceName}',
    config : {
        description: "Get service info",
        tags: ['api', 'service', 'serviceInfo'],
        handler: function (request, reply) {
            controller.service.getService(request.params.accessToken, request.params.serviceName, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            params: {
                accessToken : Joi.string().trim().required(),
                serviceName : Joi.string().required().valid(
                                                            dbConstants.serviceType.COURIER,
                                                            dbConstants.serviceType.REMOVAL,
                                                            dbConstants.serviceType.DELIVERY
                                                        )
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 401, message: 'Unauthorized'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var addAppVersion           = {
    method : 'POST',
    path   : '/api/service/addAppVersion',
    config : {
        description: 'NOT FOR TESTING',
        tags: ['api', 'service', 'appVersion'],
        handler: function (request, reply) {
            controller.service.addAppVersion(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken         : Joi.string().required(),
                appVersionFor       : Joi.string().required().valid(
                                                                        dbConstants.appVersionFor.CUSTOMER,
                                                                        dbConstants.appVersionFor.DRIVER
                                                                    ),
                deviceType          : Joi.string().required().valid(
                                                                        dbConstants.devices.ANDROID,
                                                                        dbConstants.devices.IOS
                                                                    ),
                updateMessage       : Joi.string().required().min(10),
                version             : Joi.number().required(),
                lastCriticalVersion : Joi.number().required()
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var addPromoCode            = {
    method: 'POST',
    path: '/api/service/addPromoCode',
    config: {
        description: 'ADD PROMO CODE',
        tags: ['api', 'service', 'promo'],
        handler: function (request, reply) {
            controller.service.addPromoCode(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken  : Joi.string().trim().required(),
                promoCode    : Joi.string().trim().required(),
                promoType    : Joi.string().required().valid(
                                                                dbConstants.promoType.CREDIT,
                                                                dbConstants.promoType.DISCOUNT
                                                            ),
                serviceType  : Joi.string().required().valid(
                                                                dbConstants.serviceType.COURIER,
                                                                dbConstants.serviceType.REMOVAL,
                                                                dbConstants.serviceType.DELIVERY
                                                            ),
                discount     : Joi.number().required(),
                credits      : Joi.number().required(),
                minAmount    : Joi.number().required(),
                location     : {
                    latitude : Joi.string().trim().required(),
                    longitude: Joi.string().trim().required()
                },
                startTime   : Joi.date().iso().min(currentLocalTime),
                endTime     : Joi.date().iso().min(currentLocalTime)
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var initializeOrderId       = {
    method: 'POST',
    path: '/api/service/initializeOrderId',
    config: {
        description: 'PLEASE DO NOT TEST',
        tags: ['api', 'service', 'initializeOrderId'],
        handler: function (request, reply) {
            controller.service.initializeOrderId(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken  : Joi.string().trim().required()
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var androidPushNotification = {
    method: 'POST',
    path: '/api/service/androidPushNotification',
    config: {
        description: 'NOT FOR TESTING ',
        tags: ['api', 'service', 'androidPushNotification'],
        handler: function (request, reply) {
            controller.service.androidPushNotification(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken     : Joi.string().trim().required(),
                deviceToken     : Joi.string().trim().required(),
                description     : Joi.string().trim().required(),
                notificatioType : Joi.string().required().valid(
                                                                            dbConstants.notificationType.ORDER_CANCELLED,
                                                                            dbConstants.notificationType.ORDER_DELIVERED,
                                                                            dbConstants.notificationType.REACHED_PICK_UP_POINT,
                                                                            dbConstants.notificationType.PICKED_UP,
                                                                            dbConstants.notificationType.REACHED_DELIVERY_POINT,
                                                                            dbConstants.notificationType.SENDING_QUOTE
                                                                        )
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var IOSPushNotification     = {
    method: 'POST',
    path: '/api/service/IOSPushNotification',
    config: {
        description: 'NOT FOR TESTING ',
        tags: ['api', 'service', 'IOSPushNotification'],
        handler: function (request, reply) {
            controller.service.IOSPushNotification(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken     : Joi.string().trim().required(),
                deviceToken     : Joi.string().trim().required(),
                description     : Joi.string().trim().required(),
                notificatioType : Joi.string().required().valid(
                    dbConstants.notificationType.ORDER_CANCELLED,
                    dbConstants.notificationType.ORDER_DELIVERED,
                    dbConstants.notificationType.REACHED_PICK_UP_POINT,
                    dbConstants.notificationType.PICKED_UP,
                    dbConstants.notificationType.REACHED_DELIVERY_POINT,
                    dbConstants.notificationType.SENDING_QUOTE
                )
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 409, message: 'Already Exists'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var serviceRoutes = [
    getService,
    addPromoCode,
    androidPushNotification,
    IOSPushNotification
];

module.exports = serviceRoutes;