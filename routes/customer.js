
var Joi              = require('joi'),
    controller       = require('../controllers'),
    commonFunction   = require('../utilities/common-function.js'),
    dbConstants      = require('../utilities/dbConstants'),
    currentLocalTime = commonFunction.getLocalTimestamp();

var getAppVersion      = {
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

var registerCustomer   = {
    method: 'POST',
    path: '/api/customer',
    config: {
        description : 'REGISTER A NEW CUSTOMER',
        tags        : ['api', 'customer', 'register'],
        //payload     : {
        //    maxBytes : 20715200,
        //    output   : 'stream',
        //    parse    : true,
        //    allow    : 'multipart/form-data'
        //},
        handler: function (request, reply) {
            controller.customer.registerCustomer(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                customerType   : Joi.string().required().valid(
                                                                dbConstants.customerType.BUSINESS_USER,
                                                                dbConstants.customerType.INDIVIDUAL_USER
                                                               ),
                firstName      : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/),
                lastName       : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/),
                email          : Joi.string().email().trim().required(),
                phone          : {
                    prefix      : Joi.string().regex(/^[-+]?[0-9]+$/).required().trim().description('Only numeric value allowed'),
                    phoneNumber : Joi.string().regex(/^[0-9]+$/).length(10).required().trim().description('Only numeric value allowed')
                },
                address        : Joi.string().trim().required().min(6),
                password       : Joi.string().trim().required().min(6).max(10),
                deviceDetails  : {
                    deviceType  : Joi.string().required().valid(
                                                                    dbConstants.devices.ANDROID,
                                                                    dbConstants.devices.IOS,
                                                                    dbConstants.devices.WEB
                                                                ),
                    deviceName  : Joi.string().required(),
                    deviceToken : Joi.string().required()

                },
                addressLatLong : {
                    latitude : Joi.number().required(),
                    longitude : Joi.number().required()
                },
                appVersion    : Joi.number().required().valid(100),
                referralCode  : Joi.string().optional().allow(''),
                profilePicture: Joi.object().meta({swaggerType: 'file'}).optional().allow('')
                //profilePic: Joi.any()
                //    .meta({swaggerType: 'file'})
                //    .required()
                //    .description('image file')
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

var loginCustomer      = {
    method: 'POST',
    path: '/api/customer/login',
    config: {
        description: 'LOGIN CUSTOMER',
        tags: ['api', 'customer', 'login'],
        handler: function (request, reply) {
            controller.customer.loginCustomer(request.payload, function (error, success) {
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
                password       : Joi.string().required().min(6).max(10),
                deviceName     : Joi.string().trim().required(),
                deviceToken    : Joi.string().trim().required(),
                latitude       : Joi.number().required(),
                longitude      : Joi.number().required()
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

var accessTokenLogin   = {
    method: 'POST',
    path: '/api/customer/accessTokenLogin',
    config: {
        description: 'LOGIN CUSTOMER USING ACCESS TOKEN',
        tags: ['api', 'customer', 'accessTokenLogin'],
        handler: function (request, reply) {
            controller.customer.accessTokenLogin(request.payload, function (error, success) {
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
                deviceName     : Joi.string().trim().required(),
                deviceToken    : Joi.string().trim().required(),
                latitude       : Joi.number().required(),
                longitude      : Joi.number().required()
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

var getCustomerInfo    = {
    method: 'GET',
    path: '/api/customer/getCustomerInfo/{accessToken}',
    config: {
        description: "GET CUSTOMER INFO",
        tags: ['api', 'customer', 'customerInfo'],
        handler: function (request, reply) {
            controller.customer.getCustomerInfo(request.params.accessToken, function (error, success) {
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

var editCustomerInfo   = {
    method: 'PUT',
    path: '/api/customer/editCustomerInfo',
    config: {
        description: 'EDIT CUSTOMER INFO',
        tags: ['api', 'customer', 'editInfo'],
        handler: function (request, reply) {
            controller.customer.editCustomerInfo(request.payload, function (error, success) {
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
                address        : Joi.string().trim().required().min(6),
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

var forgotPassword     = {
    method: 'POST',
    path: '/api/customer/forgotPassword',
    config: {
        description: 'forgot password',
        tags: ['api', 'customer', 'forgotPassword'],
        handler: function (request, reply) {
            controller.customer.forgotPassword(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                email : Joi.string().email().required()
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

var checkValidLink     = {
    method: 'POST',
    path: '/api/customer/checkValidLink',
    config: {
        description: 'TO CHECK VALID LINK',
        tags: ['api', 'customer', 'checkValidLink'],
        handler: function (request, reply) {
            controller.customer.checkValidLink(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                forgotPasswordToken : Joi.string().trim().required()
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

var setForgotPassword  = {
    method: 'POST',
    path: '/api/customer/setForgotPassword',
    config: {
        description: 'To set new password',
        tags: ['api', 'customer', 'setForgotPassword'],
        handler: function (request, reply) {
            controller.customer.setForgotPassword(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                 forgotPasswordToken : Joi.string().trim().required(),
                 password            : Joi.string().trim().required().min(6).max(10)
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

var facebookSignUp     = {
    method: 'POST',
    path: '/api/customer/facebookSignUp',
    config: {
        description : 'FACEBOOK SIGN_UP',
        tags        : ['api', 'customer', 'facebookSignUp'],
        //payload     : {
        //    maxBytes : 20715200,
        //    output   : 'stream',
        //    parse    : true,
        //    allow    : 'multipart/form-data'
        //},
        handler: function (request, reply) {
            controller.customer.facebookSignUp(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                customerType   : Joi.string().required().valid(
                                                                    dbConstants.customerType.BUSINESS_USER,
                                                                    dbConstants.customerType.INDIVIDUAL_USER
                                                                ),
                firstName      : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/),
                lastName       : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/),
                email          : Joi.string().email().trim().required(),
                address        : Joi.string().trim().required().min(6),
                password       : Joi.string().trim().required().min(6).max(10),
                phone         : {
                    prefix      : Joi.string().required(),
                    phoneNumber : Joi.string().regex(/^[0-9]+$/).length(10).required().trim().description('Only numeric value allowed')
                },
                deviceDetails  : {
                    deviceType  : Joi.string().required().valid(
                                                                    dbConstants.devices.ANDROID,
                                                                    dbConstants.devices.IOS
                                                                ),
                    deviceName  : Joi.string().required(),
                    deviceToken : Joi.string().required()
                },
                addressLatLong : {
                    lat  : Joi.number().required(),
                    long : Joi.number().required()
                },
                customerFbId  : Joi.string().trim().required(),
                fbAccessToken : Joi.string().trim().required(),
                appVersion    : Joi.number().required().valid(100),
                referralCode  : Joi.string().optional().allow(''),
                profilePicture: Joi.object().meta({swaggerType: 'file'}).optional().allow('')
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

var createBooking      = {
    method: 'POST',
    path: '/api/customer/createBooking',
    config: {
        description: 'TO CREATE A BOOKING',
        tags: ['api', 'customer', 'createBooking'],
        handler: function (request, reply) {
            controller.customer.createBooking(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                accessToken        : Joi.string().trim().required(),
                serviceType        : Joi.string().required().valid(
                                                                    dbConstants.serviceType.COURIER,
                                                                    dbConstants.serviceType.REMOVAL,
                                                                    dbConstants.serviceType.DELIVERY
                                                                  ),
                vehicleType           : Joi.string().required().valid(
                                                                        dbConstants.vehicleType.VAN,
                                                                        dbConstants.vehicleType.BIKE,
                                                                        dbConstants.vehicleType.THREE_TON_TRUCK,
                                                                        dbConstants.vehicleType.FIVE_TON_TRUCK,
                                                                        dbConstants.vehicleType.EIGHT_TON_TRUCK
                                                                    ),
                scheduledTime         : Joi.date().iso().required(),
                serviceAdditionalInfo : Joi.string().required().valid(
                                                                    dbConstants.serviceAdditionalInfo.IMMEDIATE,
                                                                    dbConstants.serviceAdditionalInfo.SAME_DAY,
                                                                    dbConstants.serviceAdditionalInfo.NEXT_DAY,
                                                                    dbConstants.serviceAdditionalInfo.ECONOMY,
                                                                    dbConstants.serviceAdditionalInfo.OVERNIGHT,
                                                                    dbConstants.serviceAdditionalInfo.HOURLY_RENT,
                                                                    dbConstants.serviceAdditionalInfo.LABOUR_SERVICES
                                                                ),
                serviceScope : Joi.string().required().valid(
                                                                dbConstants.serviceScope.NATIONAL,
                                                                dbConstants.serviceScope.INTERNATIONAL
                                                            ),
                pickupLocation   : {
                    latitude    : Joi.number().required(),
                    longitude   : Joi.number().required(),
                    fullAddress : Joi.string().trim().required().min(2).description('The length should be minimum two'),
                    details     : Joi.string().trim().required().min(2).description('The length should be minimum two'),
                    city        : Joi.string().trim().required().min(2).description('The length should be minimum two'),
                    state       : Joi.string().trim().required().min(2).description('The length should be minimum two')
                },
                parcelDropLocationDetails : Joi.array().required().includes(Joi.object().keys({
                    dropLocationDetail : {
                        latitude    : Joi.number().required(),
                        longitude   : Joi.number().required(),
                        fullAddress : Joi.string().trim().required().min(2).description('The length should be minimum two'),
                        details     : Joi.string().trim().required().min(2).description('The length should be minimum two'),
                        city        : Joi.string().trim().required().min(2).description('The length should be minimum two'),
                        state       : Joi.string().trim().required().min(2).description('The length should be minimum two')
                    },
                    parcelDetail : {
                        typeOfGood   : Joi.string().trim().required(),
                        descriptions : Joi.string().trim().required().min(2).description('The length should be minimum two'),
                        quantity     : Joi.number().integer().required(),
                        weight       : Joi.number().optional().allow(''),
                        weightUnit   : Joi.string().optional().allow(''),
                        dimensions   : {
                            length     : Joi.number().optional().allow(''),
                            width      : Joi.number().optional().allow(''),
                            height     : Joi.number().optional().allow(''),
                            heightUnit : Joi.string().optional().allow('')
                        }
                    }
                })),
                serviceTime : {
                    duration : Joi.number().required(),
                    timeUnit : Joi.string().required().valid(
                                                                dbConstants.serviceTimeUnit.DAY,
                                                                dbConstants.serviceTimeUnit.HOURS
                                                            )
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
                    {code: 403, message: 'FORBIDDEN'},
                    {code: 404, message: 'Customer Not Found'},
                    {code: 409, message: 'ALREADY_EXISTS_CONFLICT'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var acceptPartnerQuote = {
    method: 'POST',
    path: '/api/customer/acceptPartnerQuote',
    config: {
        description: 'TO ACCEPT A PARTNER QUOTE',
        tags: ['api', 'customer', 'acceptPartnerQuote'],
        handler: function (request, reply) {
            controller.customer.acceptPartnerQuote(request.payload, function (error, success) {
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
                orderId      : Joi.string().regex(/^[0-9]+$/).required().trim().description('Only numeric value allowed'),
                _id          : Joi.string().optional().allow(''),
                acceptStatus : Joi.string().required().valid(
                                                                dbConstants.partnerQuote.ACCEPTED,
                                                                dbConstants.partnerQuote.NOT_ACCEPTED
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

var getBookingInfo     = {
    method: 'GET',
    path: '/api/customer/getBookingInfo/{accessToken}/orderId/{orderId}',
    config: {
        description: "GET BOOKING INFO",
        tags: ['api', 'customer', 'getBookingInfo'],
        handler: function (request, reply) {
            controller.customer.getCustomerBookingInfo(request.params.accessToken,request.params.orderId, function (error, success) {
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

var getAllBooking      = {
    method: 'GET',
    path: '/api/customer/getAllBooking/{accessToken}',
    config: {
        description: "TO GET ALL CUSTOMER BOOKING",
        tags: ['api', 'customer', 'getAllBooking'],
        handler: function (request, reply) {
            controller.customer.getAllBooking(request.params.accessToken, function (error, success) {
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

var getDriverLocation  = {
    method: 'GET',
    path: '/api/customer/getDriverLocation/{accessToken}/driverEmail/{driverEmail}',
    config: {
        description: "TO GET THE DRIVER LOCATION",
        tags: ['api', 'customer', 'getDriverLocation'],
        handler: function (request, reply) {
            controller.customer.getDriverLocation(request.params.accessToken,request.params.driverEmail, function (error, success) {
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
                driverEmail : Joi.string().email().trim().required()
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

var getNotification    = {
    method: 'GET',
    path: '/api/customer/getNotification/{accessToken}',
    config: {
        description: "TO GET THE NOTIFICATION",
        tags: ['api', 'customer', 'getNotification'],
        handler: function (request, reply) {
            controller.customer.getCustomerNotification(request.params.accessToken, function (error, success) {
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

var clearCustomerNotification = {
    method: 'POST',
    path: '/api/customer/clearCustomerNotification',
    config: {
        description: 'TO CLEAR CUSTOMER NOTIFICATION',
        tags: ['api', 'customer', 'clearCustomerNotification'],
        handler: function (request, reply) {
            controller.customer.clearCustomerNotification(request.payload, function (error, success) {
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

var getAdminSocialInfo = {
    method: 'GET',
    path: '/api/customer/getAdminSocialInfo/{accessToken}',
    config: {
        description: "TO GET THE ADMIN SOCIAL INFO",
        tags: ['api', 'customer', 'getAdminSocialInfo'],
        handler: function (request, reply) {
            controller.customer.getAdminSocialInfo(request.params.accessToken, function (error, success) {
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

var createPayment      = {
    method: 'POST',
    path: '/api/customer/createPayment',
    config: {
        description: 'TO CREATE A PAYMENT | NOT FOR TESTING',
        tags: ['api', 'customer', 'createPayment'],
        handler: function (request, reply) {
            controller.customer.createPayment(request.payload, function (error, success) {
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
                //userId       : Joi.string().trim().required(),
                //password  : Joi.string().trim().required(),
                //entityId  : Joi.string().trim().required(),
                //amount  : Joi.number().required(),
                //currency  : Joi.string().trim().required(),
                //paymentBrand  : Joi.string().trim().required(),
                //paymentType  : Joi.string().trim().required(),
                //cardNumber  : Joi.string().regex(/^[0-9]+$/).required().trim().description('Numeric value'),
                //cardHolder  : Joi.string().trim().required(),
                //cardExpiryMonth  : Joi.string().regex(/^[0-9]+$/).required().trim().description('Numeric value'),
                //cardExpiryYear  : Joi.string().regex(/^[0-9]+$/).required().trim().description('Numeric value'),
                //cardCvv  : Joi.string().regex(/^[0-9]+$/).required().trim().description('Numeric value')
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

var getPaymentCredentials = {
    method: 'GET',
    path: '/api/customer/getPaymentCredentials/{accessToken}',
    config: {
        description: "TO GET THE PAYMENT CREDENTIALS",
        tags: ['api', 'customer', 'getPaymentCredentials'],
        handler: function (request, reply) {
            controller.customer.getPaymentCredentials(request.params.accessToken, function (error, success) {
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

var addPayment      = {
    method: 'POST',
    path: '/api/customer/addPayment',
    config: {
        description: 'TO ADD PAYMENT INFO',
        tags: ['api', 'customer', 'addPayment'],
        handler: function (request, reply) {
            controller.customer.addPayment(request.payload, function (error, success) {
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
                amount       : Joi.string().trim().required(),
                currencyType : Joi.string().trim().required()
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



var editCustomerData11 = {
    method: 'PUT',
    path: '/api/customer/{customerID}/logout',
    config: {
        description: 'Logout customer',
        tags: ['api', 'customer'],
        handler: function (request, reply) {

            var accessToken = request.payload.accessToken;
            controller.customer.logoutCustomer(request.params.customerID, accessToken, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            params: {
                customerID: Joi.string().alphanum().required()
            },
            payload: {
                accessToken: Joi.string().trim().required()
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

var logoutCustomer     = {
    method: 'PUT',
    path: '/api/customer/{customerID}/logout',
    config: {
        description: 'Logout customer',
        tags: ['api', 'customer'],
        handler: function (request, reply) {

            var accessToken = request.payload.accessToken;
            controller.customer.logoutCustomer(request.params.customerID, accessToken, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            params: {
                customerID: Joi.string().alphanum().required()
            },
            payload: {
                accessToken: Joi.string().trim().required()
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



var customerRoutes = [
    getAppVersion,
    registerCustomer,
    loginCustomer,
    accessTokenLogin,
    getCustomerInfo,
    editCustomerInfo,
    forgotPassword,
    checkValidLink,
    setForgotPassword,
    facebookSignUp,
    createBooking,
    acceptPartnerQuote,
    getBookingInfo,
    getAllBooking,
    getDriverLocation,
    getNotification,
    clearCustomerNotification,
    getAdminSocialInfo,
    createPayment,
    getPaymentCredentials,
    addPayment
    //logoutCustomer,

];

module.exports = customerRoutes;