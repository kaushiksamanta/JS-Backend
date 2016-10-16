var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var referral = new Schema({
    referBy      : {type: Schema.ObjectId, ref: 'customer'},
    referTo      : {type: Schema.ObjectId, ref: 'customer'},
    startTime    : {type: Date},
    endTime      : {type: Date},
    status       : {type: String, enum: [dbConstants.referralStatus.ACTIVE, dbConstants.referralStatus.EXPIRED, dbConstants.referralStatus.PENDING, dbConstants.referralStatus.CANCELLED]},
    referralCode : {type: String},
    usedFlag     : {type: Boolean, default: false},
    createdAt    : {type: Date},
    updatedAt    : {type: Date}
});

module.exports = mongoose.model('referral', referral);
