var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var driverAppVersion = new Schema({
    deviceType          : {type: String, enum: [dbConstants.devices.ANDROID, dbConstants.devices.IOS]},
    currentVersion      : {type: Number, required: true},
    updateMessage       : {type: String},
    forceUpdate         : {type: Number},
    createdAt           : {type: Date, default: Date.now},
    modifiedAt          : {type: Date}
});

module.exports = mongoose.model('driverAppVersion', driverAppVersion);
