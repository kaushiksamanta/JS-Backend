
var Joi            = require('joi'),
    controller     = require('../controllers'),
    commonFunction = require('../utilities/common-function.js');
    dbConstants    = require('../utilities/dbConstants.js');

var registerPartner;
registerPartner = {
    method: 'POST',
    path: '/api/partner/registerPartner',
    config: {
        description: 'TO REGISTER PARTNER',
        tags: ['api', 'partner', 'register'],
        handler: function (request, reply) {
            controller.admin.createPartner(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                firstName: Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/).description('Only character value allowed'),
                lastName: Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/).description('Only character value allowed'),
                companyName: Joi.string().trim().required().regex(/^([a-zA-Z_@./#&* ]){3,30}$/).description('Only character value allowed'),
                email: Joi.string().email().trim().required(),
                password: Joi.string().required().min(6).max(10),
                service: Joi.array().required().includes(Joi.object().keys({
                    serviceType: Joi.string().required().valid(
                        dbConstants.serviceType.COURIER,
                        dbConstants.serviceType.REMOVAL,
                        dbConstants.serviceType.DELIVERY,
                        dbConstants.serviceType.ALL_SERVICES
                    )
                })),
                phoneNumberPrefix: Joi.string().regex(/^[-+]?[0-9]+$/).required().trim().description('Only numeric value allowed'),
                phoneNumber: Joi.string().regex(/^[0-9]+$/).length(10).required().trim().description('Only numeric value allowed'),
                address: {
                    city: Joi.string().trim().required(),
                    fullAddress: Joi.string().trim().optional().allow(''),
                    latitude: Joi.number().optional().allow(''),
                    longitude: Joi.number().optional().allow('')
                }
            },
            failAction: function (request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function (error) {
                    reply(error);
                });
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 401, message: 'Access Denied'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var loginPartner               = {
    method: 'POST',
    path: '/api/partner/loginPartner',
    config: {
        description: 'PARTNER LOGIN',
        tags: ['api', 'partner', 'loginPartner'],
        handler: function (request, reply) {
            controller.admin.loginPartner(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                email          : Joi.string().email().trim().required(),
                password       : Joi.string().required().min(6).max(10)
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
                    {code: 401, message: 'UNAUTHORIZED'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var getOrders                  = {
    method : 'GET',
    path   : '/api/partner/getOrders/{accessToken}',
    config : {
        description: "GET ORDERS INFO",
        tags: ['api', 'admin', 'getOrders'],
        handler: function (request, reply) {
            controller.admin.getOrderData(request.params.accessToken, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            params: {
                accessToken : Joi.string().trim().required()
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

var acceptQuote                = {
    method: 'POST',
    path: '/api/partner/acceptQuote',
    config: {
        description: 'TO ACCEPT A QUOTE',
        tags: ['api', 'partner', 'acceptQuote'],
        handler: function (request, reply) {
            controller.admin.acceptQuote(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken       : Joi.string().trim().required(),
                orderId           : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed'),
                quoteValue        : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed')
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
                    {code: 401, message: 'UNAUTHORIZED'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

//var sendQuoteList              = {
//    method: 'POST',
//    path: '/api/partner/sendQuoteList',
//    config: {
//        description: 'TO SEND QUOTE LIST | NOT FOR TESTING',
//        tags: ['api', 'partner', 'sendQuoteList'],
//        handler: function (request, reply) {
//            controller.admin.sendQuoteList(request.payload, function (error, success) {
//                if (error) {
//                    reply(error.response).code(error.statusCode);
//                } else {
//                    reply(success.response).code(success.statusCode);
//                }
//            });
//        },
//        validate: {
//            payload: {
//                accessToken       : Joi.string().trim().required(),
//                orderId           : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed')
//            },
//            failAction : function(request, reply, source, error) {
//                commonFunction.failAction(request, reply, source, error, function(error) {
//                    reply(error);
//                });
//            }
//        },
//        plugins: {
//            'hapi-swagger': {
//                responseMessages: [
//                    {code: 200, message: 'OK'},
//                    {code: 400, message: 'Bad Request'},
//                    {code: 401, message: 'UNAUTHORIZED'},
//                    {code: 403, message: 'FORBIDDEN'},
//                    {code: 404, message: 'Customer Not Found'},
//                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
//                    {code: 500, message: 'Internal Server Error'}
//                ]
//            }
//        }
//    }
//};

//var sendDriverPushNotification = {
//    method: 'POST',
//    path: '/api/partner/sendDriverPushNotification',
//    config: {
//        description: 'NOT FOR TESTING',
//        tags: ['api', 'partner', 'sendDriverPushNotification'],
//        handler: function (request, reply) {
//            controller.admin.sendDriverPushNotification(request.payload, function (error, success) {
//                if (error) {
//                    reply(error.response).code(error.statusCode);
//                } else {
//                    reply(success.response).code(success.statusCode);
//                }
//            });
//        },
//        validate: {
//            payload: {
//                accessToken       : Joi.string().trim().required(),
//                orderId           : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed')
//            },
//            failAction : function(request, reply, source, error) {
//                commonFunction.failAction(request, reply, source, error, function(error) {
//                    reply(error);
//                });
//            }
//        },
//        plugins: {
//            'hapi-swagger': {
//                responseMessages: [
//                    {code: 200, message: 'OK'},
//                    {code: 400, message: 'Bad Request'},
//                    {code: 401, message: 'UNAUTHORIZED'},
//                    {code: 403, message: 'FORBIDDEN'},
//                    {code: 404, message: 'Customer Not Found'},
//                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
//                    {code: 500, message: 'Internal Server Error'}
//                ]
//            }
//        }
//    }
//};

var assignDriver               = {
    method: 'POST',
    path: '/api/partner/assignDriver',
    config: {
        description : 'TO ASSIGN DRIVER',
        tags        : ['api', 'driver', 'assignDriver'],
        handler: function (request, reply) {
            controller.admin.assignDriver(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken       : Joi.string().trim().required(),
                orderId           : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed'),
                driverEmail       : Joi.string().email().trim().required()
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
                    {code: 201, message: 'Created'},
                    {code: 400, message: 'Bad Request'},
                    {code: 401, message: 'Unauthorized'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}

                ]
            }
        }
    }
};

var getMyDriver                = {
    method : 'GET',
    path   : '/api/partner/getMyDriver/{accessToken}',
    config : {
        description: "TO GET MY DRIVER INFO",
        tags: ['api', 'admin', 'getMyDriver'],
        handler: function (request, reply) {
            controller.admin.getMyDriver(request.params.accessToken, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            params: {
                accessToken : Joi.string().trim().required()
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


var adminRoutes = [
    registerPartner,
    loginPartner,
    getOrders,
    acceptQuote,
    assignDriver,
    getMyDriver

];

module.exports = adminRoutes;
