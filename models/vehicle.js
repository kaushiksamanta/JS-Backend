var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var vehicle = new Schema({
    name            : {type: String, required: true, unique: true, enum: [
                                                                            dbConstants.vehicleType.VAN,
                                                                            dbConstants.vehicleType.BIKE,
                                                                            dbConstants.vehicleType.THREE_TON_TRUCK,
                                                                            dbConstants.vehicleType.FIVE_TON_TRUCK,
                                                                            dbConstants.vehicleType.EIGHT_TON_TRUCK
                                                                        ]
                    },
    details         : {type: String},
    vehicleImageUrl : {type: String}
});

module.exports = mongoose.model('vehicle', vehicle);
