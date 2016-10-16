var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var additionalService = new Schema({
    name : {type: String, unique: true, required: true, enum : [
                                                    dbConstants.additionalServiceType.EXPRESS_DELIVERY,
                                                    dbConstants.additionalServiceType.ENGLISH_SPEAKING_DRIVER
                                                ]
            },
    cost : {type: Number}
});

module.exports = mongoose.model('additionalService', additionalService);
