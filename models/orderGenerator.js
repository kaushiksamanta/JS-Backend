var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var orderIdGenerator = new Schema({
    currentOrderId : {type: Number, default: 0},
    createdAt      : {type: Date, default: Date.now}
});

module.exports = mongoose.model('orderIdGenerator', orderIdGenerator);
