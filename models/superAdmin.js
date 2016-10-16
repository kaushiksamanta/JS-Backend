var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var superAdmin = new Schema({
    accessToken       : {type: String, required: true},
    type              : {type: String, default: dbConstants.userType.SUPER_ADMIN,
                                        enum: [
                                            dbConstants.userType.ADMIN,
                                            dbConstants.userType.SUPER_ADMIN
                                        ]
                        },
    email             : {type: String, unique: true, required: true},
    firstName         : {type: String, required: true},
    lastName          : {type: String, required: true},
    fullName          : {type: String, required: true},
    phoneNumberPrefix : {type: String},
    phoneNumber       : {type: Number, unique : true, required: true},
    password          : {type: String, required : true},
    createdAt         : {type: Date,   default: Date.now},
    lastLogin         : {type: Date},
    modifiedAt        : {type: Date}
});

module.exports = mongoose.model('superAdmin', superAdmin);
