
var Joi            = require('joi'),
    controller     = require('../controllers'),
    commonFunction = require('../utilities/common-function.js');




var registerSuperAdmin    = {
    method : 'POST',
    path   : '/api/superAdmin/registerSuperAdmin',
    config : {
        description : 'TO REGISTER SUPER ADMIN',
        tags        : ['api', 'superAdmin'],
        handler: function (request, reply) {
            controller.superAdmin.createSuperAdmin(request.payload, function (error, success) {
                if (error) {
                    reply(error.response).code(error.statusCode);
                } else {
                    reply(success.response).code(success.statusCode);
                }
            });
        },
        validate: {
            payload: {
                email             : Joi.string().email().trim().required(),
                password          : Joi.string().required().min(6).max(10),
                firstName         : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/).description('Only character value allowed'),
                lastName          : Joi.string().trim().required().regex(/^([a-zA-Z ]){2,30}$/).description('Only character value allowed'),
                phoneNumberPrefix : Joi.string().regex(/^[-+]?[0-9]+$/).required().trim().description('Only numeric value allowed'),
                phoneNumber       : Joi.string().regex(/^[0-9]+$/).length(10).required().trim()
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
                    {code: 404, message: 'Customer Not Found'},
                    {code: 500, message: 'Internal Server Error'}
                ]
            }
        }
    }
};

var superAdminRoutes = [
    registerSuperAdmin
];

module.exports = superAdminRoutes;

