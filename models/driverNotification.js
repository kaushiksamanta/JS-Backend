var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var driverNotification = new Schema({
    orderId      : {type: Number, required: true, ref: 'order'},
    driverId     : {type: Schema.ObjectId, required: true, ref: 'driver'},
    type         : {type: String, required: true, enum : [dbConstants.driverNotificationType.ORDER_REQUEST] },
    body         : {type: String},
    isRead       : {type: Boolean, default: false},
    isDeleted    : {type: Boolean, default: false},
    createdAt    : {type: Date, default: Date.now}
});

module.exports = mongoose.model('driverNotification', driverNotification);
