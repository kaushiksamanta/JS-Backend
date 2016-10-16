var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var serviceScope = new Schema({
    name : {type: String, unique: true, required: true,enum :[dbConstants.serviceScope.NATIONAL, dbConstants.serviceScope.INTERNATIONAL]}
});

module.exports = mongoose.model('serviceScope', serviceScope);
