
var Joi              = require('joi'),
    controller       = require('../controllers'),
    commonFunction   = require('../utilities/common-function.js'),
    dbConstants      = require('../utilities/dbConstants'),
    currentLocalTime = commonFunction.getLocalTimestamp();

var getAppVersion           = {
    method: 'GET',
    path: '/api/customer/getAppVersion/{appVersionFor}/deviceType/{deviceType}',
    config: {
        description: "GET APP VERSION INFO",
        tags: ['api', 'customer', 'appVersionInfo'],
        handler: function (request, reply) {
            controller.customer.getAppVersion(request.params.appVersionFor, request.params.deviceType, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            params: {
                appVersionFor : Joi.string().trim().required(),
                deviceType    : Joi.string().trim().required()
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
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

var getPartnerList          = {
    method: 'GET',
    path: '/api/driver/getPartnerList',
    config: {
        description: "TO GET PARTNER LIST",
        tags: ['api', 'driver', 'getPartnerList'],
        handler: function (request, reply) {
            controller.driver.getPartnerList(function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        //validate: {
        //    params: {
        //        appVersionFor : Joi.string().trim().required(),
        //        deviceType    : Joi.string().trim().required()
        //    }
        //},
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
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

var registerDriver          = {
    method: 'POST',
    path: '/api/driver/registerDriver',
    config: {
        description : 'TO REGISTER A DRIVER',
        tags        : ['api', 'driver', 'registerDriver'],
        //payload     : {
        //    maxBytes : 20715200,
        //    output   : 'stream',
        //    parse    : true,
        //    allow    : 'multipart/form-data'
        //},
        handler: function (request, reply) {
            controller.driver.registerDriver(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                firstName                 : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/).description('Only characters are allowed, minimum two characters'),
                lastName                  : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/).description('Only characters are allowed, minimum two characters'),
                email                     : Joi.string().email().trim().required(),
                phone                     : {
                    prefix      : Joi.string().regex(/^[-+]?[0-9]+$/).required().trim().description('Only numeric value allowed'),
                    phoneNumber : Joi.string().regex(/^[0-9]+$/).length(10).required().trim().description('Only numeric value allowed')
                },
                companyName               : Joi.string().trim().required().min(3).max(25),
                service                   : Joi.array().required().includes(Joi.object().keys({
                    serviceType           : Joi.string().required().valid(
                                                                            dbConstants.serviceType.COURIER,
                                                                            dbConstants.serviceType.REMOVAL,
                                                                            dbConstants.serviceType.DELIVERY,
                                                                            dbConstants.serviceType.ALL_SERVICES
                                                                        )
                })),
                vehicle : Joi.array().required().includes(Joi.object().keys({
                    vehicleType               : Joi.string().required().valid(
                                                                                dbConstants.vehicleType.VAN,
                                                                                dbConstants.vehicleType.BIKE,
                                                                                dbConstants.vehicleType.THREE_TON_TRUCK,
                                                                                dbConstants.vehicleType.FIVE_TON_TRUCK
                                                                            )
                })),
                vehicleRegistrationNumber : Joi.string().trim().required().regex(/^([a-zA-Z0-9 ]){3,50}$/).description('Only character and numbers are allowed'),
                password                  : Joi.string().trim().required().min(6).max(10),
                addressLatLong            : {
                    latitude  : Joi.number().required(),
                    longitude : Joi.number().required()
                },
                deviceDetails             : {
                    deviceType  : Joi.string().required().valid(
                                                                    dbConstants.devices.ANDROID,
                                                                    dbConstants.devices.IOS,
                                                                    dbConstants.devices.WEB
                                                                ),
                    deviceName  : Joi.string().required(),
                    deviceToken : Joi.string().required()

                },
                appVersion                : Joi.number().required().valid(100),
                profilePicture            : Joi.object().meta({swaggerType: 'file'}).optional().allow('')
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

var resendVerificationToken = {
    method: 'POST',
    path: '/api/driver/resendVerificationToken',
    config: {
        description : 'TO RESEND VERIFICATION TOKEN',
        tags        : ['api', 'driver', 'resendVerificationToken'],
        handler: function (request, reply) {
            controller.driver.resendVerificationToken(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken       : Joi.string().trim().required().min(3)
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

var verifySignUp            = {
    method: 'POST',
    path: '/api/driver/verifySignUp',
    config: {
        description : 'TO VERIFY SIGN UP',
        tags        : ['api', 'driver', 'verifySignUp'],
        handler: function (request, reply) {
            controller.driver.verifySignUp(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken       : Joi.string().trim().required().min(3),
                verificationToken : Joi.string().trim().required().regex(/^([a-zA-Z0-9]){3,50}$/).description('Only character and numbers are allowed')
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

var driverPhoneLogin        = {
    method: 'POST',
    path: '/api/driver/driverPhoneLogin',
    config: {
        description: 'LOGIN DRIVER',
        tags: ['api', 'driver', 'login'],
        handler: function (request, reply) {
            controller.driver.driverPhoneLogin(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                phoneNumber    : Joi.string().regex(/^[0-9]+$/).length(10).required().trim().description('Only numeric value allowed'),
                password       : Joi.string().required().min(6).max(10),
                deviceName     : Joi.string().trim().required(),
                deviceToken    : Joi.string().trim().required(),
                addressLatLong : {
                    latitude  : Joi.number().required(),
                    longitude : Joi.number().required()
                }
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

var driverAccessTokenLogin  = {
    method: 'POST',
    path: '/api/driver/driverAccessTokenLogin',
    config: {
        description: 'TO LOGIN DRIVER USING ACCESS TOKEN',
        tags: ['api', 'driver', 'driverAccessTokenLogin'],
        handler: function (request, reply) {
            controller.driver.driverAccessTokenLogin(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken    : Joi.string().trim().required(),
                deviceName     : Joi.string().trim().required(),
                deviceToken    : Joi.string().trim().required(),
                addressLatLong : {
                    latitude  : Joi.number().required(),
                    longitude : Joi.number().required()
                }
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
                    {code: 401, message: 'Access Denied'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var getDriverInfo           = {
    method: 'GET',
    path: '/api/driver/getDriverInfo/{accessToken}',
    config: {
        description: "TO GET DRIVER INFO",
        tags: ['api', 'driver', 'getDriverInfo'],
        handler: function (request, reply) {
            controller.driver.getDriverInfo(request.params.accessToken, function (error, success) {
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
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var editDriverInfo          = {
    method: 'PUT',
    path: '/api/driver/editDriverInfo',
    config: {
        description: 'TO EDIT DRIVER INFO',
        tags: ['api', 'driver', 'editDriverInfo'],
        handler: function (request, reply) {
            controller.driver.editDriverInfo(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken    : Joi.string().trim().required(),
                firstName      : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/),
                lastName       : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/),
                service        : Joi.array().required().includes(Joi.object().keys({
                    serviceType : Joi.string().required().valid(
                                                                    dbConstants.serviceType.COURIER,
                                                                    dbConstants.serviceType.REMOVAL,
                                                                    dbConstants.serviceType.DELIVERY,
                                                                    dbConstants.serviceType.ALL_SERVICES
                                                                )
                })),
                vehicle        : Joi.array().required().includes(Joi.object().keys({
                    vehicleType : Joi.string().required().valid(
                                                                    dbConstants.vehicleType.VAN,
                                                                    dbConstants.vehicleType.BIKE,
                                                                    dbConstants.vehicleType.THREE_TON_TRUCK,
                                                                    dbConstants.vehicleType.FIVE_TON_TRUCK
                                                                )
                })),
                addressLatLong : {
                    latitude  : Joi.number().required(),
                    longitude : Joi.number().required()
                }
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        response: {
            options: {
                allowUnknown: true
            },

            schema: {
                id: Joi.any(),
                accessToken: Joi.any()
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var driverForgotPassword    = {
    method: 'POST',
    path: '/api/driver/driverForgotPassword',
    config: {
        description: 'FORGOT PASSWORD FOR DRIVER',
        tags: ['api', 'driver', 'driverForgotPassword'],
        handler: function (request, reply) {
            controller.driver.driverForgotPassword(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                phoneNumber : Joi.string().regex(/^[0-9]+$/).length(10).required().trim().description('Only numeric value allowed')
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
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var driverResetPassword     = {
    method: 'POST',
    path: '/api/driver/driverResetPassword',
    config: {
        description: 'DRIVER RESET PASSWORD',
        tags: ['api', 'driver', 'driverResetPassword'],
        handler: function (request, reply) {
            controller.driver.driverResetPassword(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken : Joi.string().trim().required(),
                oldPassword : Joi.string().trim().required().min(6).max(10),
                newPassword : Joi.string().trim().required().min(6).max(10)
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
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var driverLogout            = {
    method: 'PUT',
    path: '/api/driver/driverLogout',
    config: {
        description: 'TO LOGOUT FROM APP',
        tags: ['api', 'driver', 'driverResetPassword'],
        handler: function (request, reply) {
            controller.driver.driverLogout(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
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
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var getMyBooking            = {
    method: 'GET',
    path: '/api/driver/getMyBooking/{accessToken}',
    config: {
        description: "TO GET BOOKING INFO",
        tags: ['api', 'driver', 'getMyBooking'],
        handler: function (request, reply) {
            controller.driver.getMyBooking(request.params.accessToken, function (error, success) {
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
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var getTodayBooking         = {
    method: 'GET',
    path: '/api/driver/getTodayBooking/{accessToken}',
    config: {
        description: "TO GET TODAY BOOKING INFO",
        tags: ['api', 'driver', 'getTodayBooking'],
        handler: function (request, reply) {
            controller.driver.getTodayBooking(request.params.accessToken, function (error, success) {
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
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var getBookinginfo          = {
    method: 'GET',
    path: '/api/driver/getBookinginfo/{accessToken}/orderId/{orderId}',
    config: {
        description: "TO GET BOOKING INFO",
        tags: ['api', 'driver', 'getBookinginfo'],
        handler: function (request, reply) {
            controller.driver.getBookingInfo(request.params.accessToken, request.params.orderId, function (error, success) {
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
                orderId     : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed')
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var acceptRequestByPartner  = {
    method: 'POST',
    path: '/api/driver/acceptRequestByPartner',
    config: {
        description: 'TO ACCEPT THE REQUEST BY PARTNER',
        tags: ['api', 'driver', 'acceptRequestByPartner'],
        handler: function (request, reply) {
            controller.driver.acceptRequestByPartner(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken : Joi.string().trim().required(),
                orderId     : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed'),
                status      : Joi.string().required().valid(
                                                                dbConstants.rideRequest.ACCEPT,
                                                                dbConstants.rideRequest.REJECT
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
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var updateDriverLocation    = {
    method: 'PUT',
    path: '/api/driver/updateDriverLocation',
    config: {
        description: 'TO UPDATE THE DRIVER LOCATION',
        tags: ['api', 'driver', 'updateDriverLocation'],
        handler: function (request, reply) {
            controller.driver.updateDriverLocation(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken    : Joi.string().trim().required(),
                addressLatLong : {
                    latitude  : Joi.number().required(),
                    longitude : Joi.number().required()
                }
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        response: {
            options: {
                allowUnknown: true
            },

            schema: {
                id: Joi.any(),
                accessToken: Joi.any()
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var updateOrderStatus       = {
    method: 'PUT',
    path: '/api/driver/updateOrderStatus',
    config: {
        description: 'TO UPDATE THE ORDER STATUS',
        tags: ['api', 'driver', 'updateOrderStatus'],
        handler: function (request, reply) {
            controller.driver.updateOrderStatus(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken    : Joi.string().trim().required(),
                orderId        : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed'),
                orderStatus    : Joi.string().required().valid(
                                                                dbConstants.orderStatus.REACHED_PICKUP_POINT,
                                                                dbConstants.orderStatus.PICKED_UP,
                                                                dbConstants.orderStatus.REACHED_DELIVERY_POINT,
                                                                dbConstants.orderStatus.ORDER_DELIVERED
                                                              )
            },
            failAction : function(request, reply, source, error) {
                commonFunction.failAction(request, reply, source, error, function(error) {
                    reply(error);
                });
            }
        },
        response: {
            options: {
                allowUnknown: true
            },

            schema: {
                id: Joi.any(),
                accessToken: Joi.any()
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var getNotification         = {
    method: 'GET',
    path: '/api/driver/getNotification/{accessToken}',
    config: {
        description: "TO GET THE NOTIFICATION",
        tags: ['api', 'driver', 'getNotification'],
        handler: function (request, reply) {
            controller.driver.getNotification(request.params.accessToken, function (error, success) {
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
            }
        },
        plugins: {
            'hapi-swagger': {
                responseMessages: [
                    {code: 200, message: 'OK'},
                    {code: 400, message: 'Bad Request'},
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }

    }
};

var clearNotification       = {
    method: 'POST',
    path: '/api/driver/clearNotification',
    config: {
        description : 'TO CLEAR THE NOTIFICATION',
        tags : ['api', 'driver', 'clearNotification'],
        handler: function (request, reply) {
            controller.driver.clearNotification(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
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
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};


var customerRoutes = [
    getPartnerList,
    registerDriver,
    resendVerificationToken,
    verifySignUp,
    driverPhoneLogin,
    driverAccessTokenLogin,
    getDriverInfo,
    editDriverInfo,
    driverForgotPassword,
    driverResetPassword,
    driverLogout,
    getMyBooking,
    getTodayBooking,
    getBookinginfo,
    acceptRequestByPartner,
    updateDriverLocation,
    updateOrderStatus,
    getNotification,
    clearNotification
];

module.exports = customerRoutes;
