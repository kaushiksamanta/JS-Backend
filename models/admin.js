var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var admin = new Schema({
    accessToken       : {type: String},
    type              : {type: String, default: dbConstants.userType.ADMIN,
                         enum: [
                                    dbConstants.userType.ADMIN,
                                    dbConstants.userType.SUPER_ADMIN
                                ]
                        },
    email             : {type: String, unique: true, required: true},
    firstName         : {type: String, required: true},
    lastName          : {type: String, required: true},
    fullName          : {type: String, required: true},
    companyName       : {type: String, required: true, unique: true},
    serviceType       : [{type: String, required : true,
                          enum: [
                                    dbConstants.serviceType.COURIER,
                                    dbConstants.serviceType.REMOVAL,
                                    dbConstants.serviceType.DELIVERY,
                                    dbConstants.serviceType.ALL_SERVICES
                                ]
                         }],
    address           : {
        city          : {type: String, required: true},
        fullAddress   : {type: String},
        latitude      : {type: Number},
        longitude     : {type: Number}
    },
    phoneNumberPrefix : {type: String},
    phoneNumber       : {type: Number, unique: true, required: true},
    password          : {type: String, required: true},
    isDeleted         : {type: Boolean, default: false},
    isBlocked         : {type: Boolean, default: false},
    createdAt         : {type: Date,   default: Date.now},
    lastLogin         : {type: Date},
    modifiedAt        : {type: Date}
});

module.exports = mongoose.model('admin', admin);
