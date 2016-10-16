var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var promo = new Schema({
    promoType    : {type: String, required: true, enum: [dbConstants.promoType.CREDIT, dbConstants.promoType.DISCOUNT]},
    serviceType  : {type: String, required: true, enum: [
                                                            dbConstants.serviceType.COURIER,
                                                            dbConstants.serviceType.REMOVAL,
                                                            dbConstants.serviceType.DELIVERY
                                                        ]},
    promoCode    : {type: String},
    discount     : {type: Number},
    credits      : {type: Number, default: 0},
    minAmount    : {type: Number, required: true},
    status       : { type: String, enum: [dbConstants.promoStatus.ACTIVE, dbConstants.promoStatus.EXPIRED, dbConstants.promoStatus.PENDING,
                                         dbConstants.promoStatus.CANCELLED], default : dbConstants.promoStatus.ACTIVE},
    location      : {
        latitude  : {type: String},
        longitude : {type: String}
    },
    startTime     : {type: Date},
    endTime       : {type: Date},
    isDeleted     : {type: Boolean, default: false},
    isBlocked     : {type: Boolean, default: false},
    createdAt     : {type: Date, default: Date.now},
    updatedAt     : {type: Date}
});

module.exports = mongoose.model('promo', promo);



