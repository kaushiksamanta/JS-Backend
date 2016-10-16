
var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;


var card = new Schema({
    cardNumber      : {type: Number, required: true},
    cardHolder      : {type: String},
    cardExpiryMonth : {type: Number},
    cardExpiryYear  : {type: Number},
    cardCvv         : {type: Number},
    isDefault       : {type: Boolean, default: false},
    addedAt         : {type: Date, default: Date.now}
});

var customer = new Schema({
    customerType      : {type: String, required: true, enum: [dbConstants.customerType.BUSINESS_USER, dbConstants.customerType.INDIVIDUAL_USER]},
    accessToken       : {type: String, required: true},
    firstName         : {type: String},
    lastName          : {type: String},
    fullName          : {type: String},
    referralCode      : {type: String},
    email             : {type: String, unique: true},
    credits           : {type: Number, default: 0},
    phone             : {
        prefix      : {type: String},
        phoneNumber : {type: Number, unique: true}
    },
    customerImageUrls : {
        profilePicture      : {type: String, default: null},
        profilePictureThumb : {type: String, default: null}
    },
    address           : {type : String},
    addressLatLong    : {
        latitude  : {type : Number},
        longitude : {type : Number}
    },
    password          : {type: String},
    customerFbId      : {type: String},
    fbAccessToken     : {type: String},
    deviceDetails    : {
        deviceType   : {type: String, enum: [
                                                dbConstants.devices.ANDROID,
                                                dbConstants.devices.IOS,
                                                dbConstants.devices.WEB
                                            ]},
        deviceName   : {type: String},
        deviceToken  : {type: String, default: ''}
    },
    customerRating    : {
        totalRatingGot : {type: Number},
        noOfUserRated  : {type: Number},
        finalRating    : {type: Number}
    },
    isDeleted        : {type: Boolean, default: false},
    isBlocked        : {type: Boolean, default: false},
    loggedInStatus   : {type : String, enum: [dbConstants.loginStatus.ACTIVE, dbConstants.loginStatus.DEACTIVE]},
    appVersion       : {type: Number},
    timezone         : {type: String},
    cards            : {type: [card], default: []},
    forgotPasswordToken : {type: String},
    lastLogin        : {type: Date},
    createdAt        : {type: Date, default: Date.now},
    modifiedAt       : {type: Date}
});

module.exports = mongoose.model('customer', customer);

