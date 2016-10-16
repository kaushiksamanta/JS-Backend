var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var document = new Schema({
    title         : {type: String, required: true},
    documentLink  : {type: String, required: true},
    addedAt       : {type: Date, required: true}
});

var driver = new Schema({
    accessToken               : {type : String, required : true},
    serviceType               : [{type: String, required : true, enum: [
                                                                        dbConstants.serviceType.COURIER,
                                                                        dbConstants.serviceType.REMOVAL,
                                                                        dbConstants.serviceType.DELIVERY,
                                                                        dbConstants.serviceType.ALL_SERVICES
                                                                ]}],
    vehicleType               : [{type: String, required : true, enum: [
                                                                            dbConstants.vehicleType.VAN,
                                                                            dbConstants.vehicleType.BIKE,
                                                                            dbConstants.vehicleType.THREE_TON_TRUCK,
                                                                            dbConstants.vehicleType.FIVE_TON_TRUCK,
                                                                            dbConstants.vehicleType.EIGHT_TON_TRUCK
                                                                        ]}],
    firstName                 : {type: String, required : true},
    lastName                  : {type: String, required : true},
    fullName                  : {type: String, required : true},
    email                     : {type : String, required : true, unique: true},
    password                  : {type: String, required : true},
    driverImageUrl            : {type: String},
    companyName               : {type: String},
    vehicleRegistrationNumber : {type: String, required : true, unique: true},
    phone                     : {
        prefix      : {type: String},
        phoneNumber : {type: Number, required : true, unique: true}
    },
    deviceDetails            : {
            deviceType  : {type: String, required : true, enum: [
                                                                    dbConstants.devices.ANDROID,
                                                                    dbConstants.devices.IOS,
                                                                    dbConstants.devices.WEB
                                                                ]
                          },
            deviceName  : {type: String},
            deviceToken : {type: String, required : true}
    },
    addressLatLong    : {
        latitude  : {type : Number},
        longitude : {type : Number}
    },
    driverRating             : {
        totalRatingGot : {type: Number},
        noOfUserRated  : {type: Number},
        finalRating    : {type: Number}
    },
    loggedInStatus           : {type : String,
                                                default: dbConstants.loginStatus.ACTIVE,
                                                enum: [
                                                            dbConstants.loginStatus.ACTIVE,
                                                            dbConstants.loginStatus.DEACTIVE
                                                ]
                                },
    verificationToken        : {type: String, default: ''},
    documents                : {type: [document], default: []},
    appVersion               : {type: Number},
    forgotPasswordToken      : {type: String},
    timezone                 : {type: String},
    lastLogin                : {type: Date},
    registrationDate         : {type: Date},
    createdAt                : {type: Date, default: Date.now},
    modifiedAt               : {type: Date},
    isVerified               : {type: Boolean, default: false},
    isDeleted                : {type: Boolean, default: false},
    isBlocked                : {type: Boolean, default: false},
    isOnline                 : {type: Boolean, default: true},
    isAvailable              : {type: Boolean, default: true}
});

module.exports = mongoose.model('driver', driver);
