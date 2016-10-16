var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var material = new Schema({
    name         : {type: String, required: true, enum :[dbConstants.materialType.PARCEL,dbConstants.materialType.DOCUMENT,dbConstants.materialType.OTHER], unique: true},
    vehicleId    : [{type: Schema.ObjectId, ref : 'vehicle'}],
    details      : {type: String}
});

module.exports = mongoose.model('material', material);
