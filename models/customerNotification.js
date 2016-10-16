var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var customerNotification = new Schema({
    orderId      : {type : Number, required : true, ref: 'order'},
    customerId   : {type : Schema.ObjectId, required : true, ref: 'customer'},
    type         : {type : String,
                    enum : [
                                dbConstants.notificationType.ORDER_CANCELLED, dbConstants.notificationType.ORDER_DELIVERED,
                                dbConstants.notificationType.REACHED_PICK_UP_POINT, dbConstants.notificationType.PICKED_UP,
                                dbConstants.notificationType.REACHED_DELIVERY_POINT,dbConstants.notificationType.SENDING_QUOTE
                           ]
                    },
    body         : {type : String},
    isRead       : {type : Boolean, default : false},
    isDeleted    : {type : Boolean, default : false},
    createdAt    : {type : Date, default    : Date.now}
});

module.exports = mongoose.model('customerNotification', customerNotification);