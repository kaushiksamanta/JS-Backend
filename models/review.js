var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var review = new Schema({
    serviceName     : {type: String},
    serviceDetails  : {type: String},
    serviceImageUrl : {type: String}
});

module.exports = mongoose.model('review', review);
