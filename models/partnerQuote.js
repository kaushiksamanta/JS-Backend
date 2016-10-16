var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var partnerQuote = new Schema({
    adminId         : {type : Schema.ObjectId, ref: 'admin'},
    orderId         : {type : Schema.ObjectId, ref: 'order'},
    companyName     : {type : String},
    customOrderId   : {type : Number},
    quoteValue      : {type : Number},
    quoteStatus     : {type : String, default: dbConstants.partnerQuote.NOT_ACCEPTED,
                        enum : [
                                    dbConstants.partnerQuote.ACCEPTED,
                                    dbConstants.partnerQuote.NOT_ACCEPTED
                                ]
                      },
    createdAt       : {type : Date, default: Date.now},
    modifiedAt      : {type : Date, default: Date.now}
});

module.exports = mongoose.model('partnerQuote', partnerQuote);