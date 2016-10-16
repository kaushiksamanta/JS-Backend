 var mongoose    = require('mongoose'),
     dbConstants = require('../utilities/dbConstants'),
     Schema      = mongoose.Schema;

var service = new Schema({
    name                : {type: String, enum :[dbConstants.serviceType.COURIER, dbConstants.serviceType.REMOVAL,dbConstants.serviceType.DELIVERY],
                            required : true, unique:true},
    vehicleId           : [{type: Schema.ObjectId, ref : 'vehicle'}],
    additionalServiceId : [{type: Schema.ObjectId, ref : 'additionalService'}],
    serviceScopeId      : [{type: Schema.ObjectId, ref : 'serviceScope'}],
    materialId          : [{type: Schema.ObjectId, ref : 'material'}],
    details             : {type: String}
});

module.exports = mongoose.model('service', service);
