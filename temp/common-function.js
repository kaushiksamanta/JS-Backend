/**
 * Created by harekam on 4/23/15.
 */

var request = require('request');
var constants = require('./constants');
var dbConstants = require('./dbConstants');
var DAO = require('../dao/DAO');
var momentTimezone = require('moment-timezone');
var Distance = require('geo-distance');
var config = require('../config/config');
var dist = require('geo-distance-js');
var async = require('async');
var models = require('../models');
var gcm = require('node-gcm');
var debugging_enabled = true;
var apns = require('apn');
var nodemailer = require('nodemailer');
var fs = require('node-fs');
var AWS = require('aws-sdk');
var moment = require('moment');
var md5 = require('MD5');
var _ = require('underscore');
var log4js = require('log4js');
var logger = log4js.getLogger('[UTIL]');
var smtpTransport = undefined;
var Path = require('path');
/*
 * -----------------------------------------------
 * CHECK EACH ELEMENT OF ARRAY FOR BLANK.
 * -----------------------------------------------
 */
function checkBlank(arr) {
    var arrlength = arr.length;
    for (var i = 0; i < arrlength; i++) {
        if (arr[i] === undefined) {
            arr[i] = "";
        } else {
            arr[i] = arr[i];
        }
        arr[i] = arr[i];
        if (arr[i] === '' || arr[i] === "" || arr[i] == undefined) {
            return 1;
        }
    }
    return 0;
}

/*
 * -----------------------------------------------
 * CHECK BLANK WITH CALL BACK.
 * -----------------------------------------------
 */

exports.checkBlankWithCallback = function (blankData, callback) {
    var checkBlankData = checkBlank(blankData);
    if (checkBlankData) {

        var errResponse = {
            message: constants.responseMessage.PARAMETER_MISSING,
            data: {}
        };
        callback(errResponse);
    } else {
        callback(null);
    }
};


exports.createJsonFromPayload = function (payload) {
    var data = {};
    for (var key in payload) {
        if (payload.hasOwnProperty(key) && payload[key]) {
            data[key] = payload[key];
        }
    }
    return data;
};

/*
 return date in UTC format Eg:(2015-04-29 06:24:40) from local (Wed Apr 29 2015 11:54:40 GMT+0530 (IST))
 */
exports.getUTCDate = function () {
    return new Date().toISOString();
};

exports.getTimestamp = function (inDate) {
    if (inDate)
        return new Date();
    else
        return new Date().toISOString();
};

exports.getDate = function (date) {
    return date.setMinutes(date.getMinutes() + constants.TIMEZONE_OFFSET);
};

function getTodayAndTomorrow(inDate) {

    var today = moment().startOf('day').toDate(),
        tomorrow = moment(today).add(1, 'days').toDate();

    today.setMinutes(today.getMinutes() + constants.TIMEZONE_OFFSET);
    tomorrow.setMinutes(tomorrow.getMinutes() + constants.TIMEZONE_OFFSET);

    if (inDate)
        return {today: today, tomorrow: tomorrow};
    else
        return {today: today.toISOString(), tomorrow: tomorrow.toISOString()};

}

exports.getDay = function (date) {
    if (!date)
        date = new Date();
    logger.debug(date);
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    return weekday[date.getDay()];
};

exports.makeIdArray = function (data, keyName) {
    var arrIds = [];
    if (!keyName)
        keyName = '_id';
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            //logger.debug(data[key][keyName]);
            arrIds.push(data[key][keyName]);
        }
    }
    return arrIds;
};


exports.verifyAuthorization = function (id, user, accessToken, callbackResult) {
    async.waterfall([
        function (callback) {

            var condition = {_id: id},
                projection = {accessToken: 1},
                options = {limit: 1, lean: true},
                model;


            if (user === constants.USER_TYPE.CUSTOMER) {
                model = models.customer;
            } else if (user === constants.USER_TYPE.SERVICE_PROVIDER) {
                projection.status = 1;
                model = models.serviceProvider;
            }

            DAO.getData(model, condition, projection, options, callback);


        }, function (data, callback) {

            var error;
            if (data && data.length > 0) {

                if (user === constants.USER_TYPE.SERVICE_PROVIDER && data[0].status === dbConstants.SERVICE_PROVIDER_STATUS.REVIEW_PENDING) {
                    error = {
                        response: {
                            message: constants.responseMessage.SERVICE_PROVIDER_UNDER_REVIEW,
                            data: {}
                        },
                        statusCode: constants.STATUS_CODE.UNAUTHORIZED
                    };
                    return callback(error);
                }

                if (user === constants.USER_TYPE.CUSTOMER && isContains(accessToken, data[0].accessToken))
                    return callback(null);


                if (user === constants.USER_TYPE.SERVICE_PROVIDER && (accessToken === data[0].accessToken))
                    return callback(null);


                error = {
                    response: {
                        message: constants.responseMessage.INVALID_ACCESS,
                        data: {}
                    },
                    statusCode: constants.STATUS_CODE.UNAUTHORIZED
                };
                return callback(error);

            }

            error = {
                response: {
                    message: constants.responseMessage.USER_NOT_FOUND,
                    data: {}
                },
                statusCode: constants.STATUS_CODE.NOT_FOUND
            };
            return callback(error);

        }
    ], function (error) {
        if (error)
            return callbackResult(error);

        return callbackResult(null);

    })
};

function slotsToMinutes(slots) {
    var bits = slotsToBits(slots);
    var minutes = [], count = 0;
    for (var i = 0; i < 48; i++) {
        if (bits[i] == 1) {
            minutes.push(count);
        }
        count += 30;
    }
    return minutes;
}

function slotsToBits(slots) {

    var count = 0, counter = 0.5, k = 0, bits = [];
    var slotsLen = slots.length;
    for (var i = 0; i < 48; i++) {
        if (k < slotsLen) {
            if (count >= slots[k] && count < slots[k + 1]) {
                bits[i] = 1;
            } else if (count == slots[k + 1]) {
                bits[i] = 1;
                k += 2;
            }
        } else {
            bits[i] = 0;
        }
        count += counter;

    }
    return bits;
}

exports.processSlots = function (data) {
    var availability = {};
    availability.Monday = slotsToMinutes(data.Monday);
    availability.Tuesday = slotsToMinutes(data.Tuesday);
    availability.Wednesday = slotsToMinutes(data.Wednesday);
    availability.Thursday = slotsToMinutes(data.Thursday);
    availability.Friday = slotsToMinutes(data.Friday);
    availability.Saturday = slotsToMinutes(data.Saturday);
    availability.Sunday = slotsToMinutes(data.Sunday);
    return availability;
};

function getLocalAndUtcTime(datetime, timezone) {

    // var formatReadable = "dddd, MMMM Do YYYY, HH:mm:ss";
    var format = 'YYYY/MM/DD HH:mm';
    var year = datetime.getFullYear();
    var month = datetime.getMonth();
    var day = datetime.getDate();
    var hour = datetime.getHours();
    var minute = datetime.getMinutes();
    var totalMinutes = hour * 60 + minute;
    var second = datetime.getMinutes();
    var millisecond = datetime.getMilliseconds();
    var Numbers = [year, month, day, hour, minute, second, millisecond];
    var dateTimeLocal = momentTimezone.tz(Numbers, timezone);
    var dateTimeAll = {
        dateTimeLocal: dateTimeLocal.format(format),
        dateTimeUTC: dateTimeLocal.utc().format(format),
        dateTimeUTCinDate: dateTimeLocal.toISOString(),
        day: dateTimeLocal.format('dddd'),
        totalMinutes: totalMinutes

    };
    console.log("time", dateTimeAll);
    return dateTimeAll;

}
function formatDateTime(datetime, format) {
    if (!format) {
        format = constants.TIMESTAMP_FORMAT;
    }
    var momentDateTime = moment(datetime).format(format);

    return new Date(momentDateTime);
}
function getEndDate(date, inDate, unit, frequency, addOffset) {

    //var start = moment(date).toDate(),
    var end = moment(date).add(frequency, unit).toDate();
    if (addOffset)
        end.setMinutes(end.getMinutes() + constants.TIMEZONE_OFFSET);

    if (inDate)
        return end;
    else
        return end.toISOString();

}


/*
 @from = {lat: lat1, lng: long1}
 @to = [{lat: lat2, lng: long2},{lat: lat2, lng: long2}]

 */
function calculateDistance(from, to) {

    //var from = {lat: lat1, lng: long1};
    //var to = [{lat: lat2, lng: long2}];

    var result = dist.getDistance(from, to, 'asc', 'metres', 2);
    return result;
}
function distanceBetween(from, geoDetails) {

    var len = geoDetails.length;
    for (var i = 0; i < len; i++) {

        var distanceDetails = Distance.between(from, geoDetails[i].to);
        distanceDetails = distanceDetails.human_readable();
        geoDetails[i].distance = parseInt(distanceDetails.distance);
    }
    return geoDetails;
}

function distanceBetweenTwoCoordinates(from, to) {

    var distanceDetails = Distance.between(from, to);
    distanceDetails = distanceDetails.human_readable();
    return parseInt(distanceDetails.distance);
}

function contains(array, arrayToBeChecked) {

    sortArray(array, 'asc');
    sortArray(arrayToBeChecked, 'asc');

    var lenCheck = arrayToBeChecked.length;
    var len = array.length;
    var i = 0, j = 0;
    while (i < len && j < lenCheck) {
        if (array[i] == arrayToBeChecked[j]) {
            j++;
        }
        i++;
    }
    return (j >= lenCheck);

}
function sortArray(array, order) {

    if (order.toLowerCase() == 'asc') {

        array.sort(function (a, b) {
            return a - b
        });

    } else if (order.toLowerCase() == 'dsc') {

        array.sort(function (a, b) {
            return b - a
        });

    }
}


/*
 //GENERIC SORTING
 */
(function () {
    if (typeof Object.defineProperty === 'function') {
        try {
            Object.defineProperty(Array.prototype, 'sortBy', {value: sb});
        } catch (e) {
        }
    }
    if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

    function sb(f) {
        for (var i = this.length; i;) {
            var o = this[--i];
            this[i] = [].concat(f.call(o, o, i), o);
        }
        this.sort(function (a, b) {
            for (var i = 0, len = a.length; i < len; ++i) {
                if (a[i] != b[i]) return a[i] < b[i] ? -1 : 1;
            }
            return 0;
        });
        for (var i = this.length; i;) {
            this[--i] = this[i][this[i].length - 1];
        }
        return this;
    }
})();

/*
 ==============================================
 send mail with defined transport object
 =============================================
 */
exports.sendEmail = function (mailOptions, callback) {

    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: config.mailer.service,
        auth: {
            user: config.mailer.auth.user,
            pass: config.mailer.auth.pass
        }
    });

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        console.log('Message sent: ' + info.response);

    });
    callback(null);
};


exports.isEmpty = function (obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

function isContains(element, array) {
    for (var i = 0; i < array.length; i++) {
        if (element == array[i])
            return true;
    }
    return false
}
exports.cryptData = function (data) {
    return md5(data);
};
exports.getDifferenceFromTwoArrays = function (array1, array2) {
    //var all = _.union(array1, array2);
    //var common = _.intersection(array1, array2);
    return _.difference(array1, array2);
};

/*
 =============================================================
 Warning not a generic function create according to your need.
 =============================================================
 */
function createHashFromObjectArray(data, key) {
    var len = data.length;
    var map = {};
    for (var i = 0; i < len; i++) {
        map[data[i][key]] = 1;
    }
    return map;
}

/*
 ==========================================================
 Send the notification to the iOS device for customer
 ==========================================================
 */
function sendIosPushNotification(iosDeviceToken, message, payload) {

    console.log(payload);


    console.log(config.iOSPushSettings.gateway);
    var certificate = Path.resolve(".") + config.iOSPushSettings.iosApnCertificate;
    logger.info("IOS certi: ", certificate);
    //if (payload.address) {
    //    payload.address = '';
    //}
    var status = 1;
    var msg = message;
    var snd = 'ping.aiff';
    //if (flag == 4 || flag == 6) {
    //    status = 0;
    //    msg = '';
    //    snd = '';
    //}


    var options = {
        cert: certificate,
        certData: null,
        key: certificate,
        keyData: null,
        passphrase: 'Serv2Day',
        ca: null,
        pfx: null,
        pfxData: null,
        gateway: config.iOSPushSettings.gateway,
        port: 2195,
        rejectUnauthorized: true,
        enhanced: true,
        cacheLength: 100,
        autoAdjustCache: true,
        connectionTimeout: 0,
        ssl: true
    };


    // var deviceToken = new apns.Device(iosDeviceToken[0]);
    var apnsConnection = new apns.Connection(options);
    var note = new apns.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.contentAvailable = 1;
    note.sound = snd;
    note.alert = msg;
    note.newsstandAvailable = status;
    note.payload = {message: payload};

    // apnsConnection.pushNotification(note, deviceToken);
    _.each(iosDeviceToken, function (token) {
        logger.trace(token);
        if (!token || token == "(null)" || token == "deviceToken") {
            logger.error("IOS PUSH ERROR with Token: ", token);
        } else {
            var device = new apns.Device(token);
            apnsConnection.pushNotification(note, device);
        }
    });
    // Handle these events to confirm that the notification gets
    // transmitted to the APN server or find error if any
    function log(type) {
        return function () {
            if (debugging_enabled)
                console.log("iOS PUSH NOTIFICATION RESULT: " + type);
        }
    }

    apnsConnection.on('error', log('error'));
    apnsConnection.on('transmitted', log('transmitted'));
    apnsConnection.on('timeout', log('timeout'));
    apnsConnection.on('connected', log('connected'));
    apnsConnection.on('disconnected', log('disconnected'));
    apnsConnection.on('socketError', log('socketError'));
    apnsConnection.on('transmissionError', log('transmissionError'));
    apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));

};


/*
 ==============================================
 Send the notification to the android device
 =============================================
 */
function sendAndroidPushNotification(deviceTokens, text, flag) {


    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: false,
        timeToLive: 2419200,
        data: {
            message: text,
            flag: flag,
            brand_name: config.androidPushSettings.brandName
        }
    });
    var sender = new gcm.Sender(config.androidPushSettings.gcmSender);
    //var registrationIds = [];
    //registrationIds.push(deviceToken);

    sender.send(message, deviceTokens, 4, function (err, result) {
        if (debugging_enabled) {
            console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(result));
            console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
        }
    });
}

/*
 * ----------------------------------------------------------------------------------------------------------------------------------------
 * Sending HTML email to a customer
 * INPUT : receiverMailId,html,subject
 * OUTPUT : mail sent
 * ----------------------------------------------------------------------------------------------------------------------------------------
 */

function sendHtmlContent(to, html, subject, attachments, callback) {


    if (smtpTransport === undefined) {
        smtpTransport = nodemailer.createTransport({
            host: config.emailCredentials.host,
            port: config.emailCredentials.port,
            auth: {
                user: config.emailCredentials.senderEmail,
                pass: config.emailCredentials.senderPassword
            }
        });
    }

    //if(to){
    //    to = removeInvalidIds(to);
    //}

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.emailCredentials.From, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: html// html body
    };
    if (attachments) {
        if (attachments.length > 0)
            mailOptions.attachments = attachments;
    }

    // send mail with defined transport object
    if (to.length > 0) {


        smtpTransport.sendMail(mailOptions, function (error, response) {

            console.log("Sending Mail Error: " + JSON.stringify(error));
            console.log("Sending Mail Response: " + JSON.stringify(response));
            if (error) {
                var errResponse = {
                    response: {
                        message: constants.responseMessage.SOMETHING_WRONG,
                        data: {}
                    },
                    statusCode: constants.STATUS_CODE.SERVER_ERROR
                };
                callback(errResponse);
            } else {
                var success = {
                    response: {
                        message: constants.responseMessage.EMAIL_SENT,
                        data: {}
                    },
                    statusCode: constants.STATUS_CODE.OK
                };
                callback(null, success);
            }
        });
    }
    else {
        var errResponse = {
            response: {
                message: constants.responseMessage.NO_DATA_FOUND,
                data: {}
            },
            statusCode: constants.STATUS_CODE.NOT_FOUND
        };
        callback(errResponse);
    }


}


exports.notifyUser = function (sendPush, sendEmail, sendMessage, toBeSend, callbackParent) {
    async.parallel([
            function (callback) {
                if (sendPush) {
                    var push = toBeSend.push;

                    var androidPushTokens = [];
                    var iosPushTokens = [];
                    var device = push.device;
                    var lenDevice = device.length;
                    for (var i = 0; i < lenDevice; i++) {
                        var deviceToken = device[i].token;
                        var deviceType = device[i].type;
                        if (deviceToken) {
                            if (deviceType === dbConstants.devices.ANDROID)
                                androidPushTokens.push(deviceToken);
                            else if (deviceType === dbConstants.devices.IOS)
                                iosPushTokens.push(deviceToken);
                        }
                    }
                    if (androidPushTokens.length > 0)
                        sendAndroidPushNotification(androidPushTokens, push.text, push.flag);
                    if (iosPushTokens.length > 0)
                        sendIosPushNotification(iosPushTokens, push.text, push.flag);


                }
                return callback(null);
            },
            function (callback) {
                if (sendEmail) {
                    var emailDetails = toBeSend.emailDetails;
                    sendHtmlContent(emailDetails.emails, emailDetails.mailContent, emailDetails.subject, emailDetails.attachments, function (err, success) {
                        if (err)
                            return callback(err);
                        return callback(null);
                    });
                } else
                    return callback(null);

            },
            function (callback) {
                if (sendMessage) {
                    var textDetails = toBeSend.textDetails;
                    sendText(textDetails.phoneNumber, textDetails.text, callback);
                } else
                    return callback(null);

            }
        ],
        function (error) {
            if (error)
                callbackParent(error);
            else
                callbackParent(null);
        })
};

function uploadImageToS3Bucket(file, isThumb, callback) {

    var path = file.path, filename = file.name, folder = file.s3Folder, mimeType = file.mimeType;
    if (isThumb) {
        path = path + 'thumb/';
        filename = file.thumbName;
        folder = file.s3FolderThumb;
    }
    //var filename = file.name; // actual filename of file
    //var path = file.path; //will be put into a temp directory
    //var mimeType = file.type;

    var accessKeyId = config.s3BucketCredentials.accessKeyId;
    var secretAccessKeyId = config.s3BucketCredentials.secretAccessKey;
    var bucketName = config.s3BucketCredentials.bucket;
    //console.log("UPLOAD", file);

    fs.readFile(path + filename, function (error, file_buffer) {
        //  console.log("UPLOAD", file_buffer);
        if (error) {
            //  console.error("UPLOAD", error);
            var errResp = {
                response: {
                    message: constants.responseMessage.SOMETHING_WRONG,
                    data: {}
                },
                statusCode: constants.STATUS_CODE.SERVER_ERROR
            };
            return callback(errResp);
        }

        //filename = file.name;
        AWS.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKeyId});
        var s3bucket = new AWS.S3();
        var params = {
            Bucket: bucketName,
            Key: folder + '/' + filename,
            Body: file_buffer,
            ACL: 'public-read',
            ContentType: mimeType
        };

        s3bucket.putObject(params, function (err, data) {
            //  console.error("PUT", err);
            if (err) {
                var error = {
                    response: {
                        message: constants.responseMessage.UPLOAD_ERROR,
                        data: {}
                    },
                    statusCode: constants.STATUS_CODE.SERVER_ERROR
                };
                return callback(error);
            }
            else {
                // console.log(data);
                deleteFile(path + filename, function (err) {
                    console.error(err);
                    if (err)
                        return callback(err);
                    else
                        return callback(null);
                })
            }
        });
    });
};

function saveFile(fileData, path, callback) {

    //var path = Path.resolve(".") + "/uploads/" + folderPath + "/" + fileName;
    var file = fs.createWriteStream(path);

    file.on('error', function (err) {
        // console.error(err);
        var error = {
            response: {
                message: constants.responseMessage.UPLOAD_ERROR,
                data: {}
            },
            statusCode: constants.STATUS_CODE.SERVER_ERROR
        };
        return callback(error);
    });

    fileData.pipe(file);

    fileData.on('end', function (err) {
        if (err) {
            var error = {
                response: {
                    message: constants.responseMessage.UPLOAD_ERROR,
                    data: {}
                },
                statusCode: constants.STATUS_CODE.SERVER_ERROR
            };
            return callback(error);
        } else
            callback(null);
    });


}

function deleteFile(path, callback) {

    fs.unlink(path, function (err) {
        // console.error("delete", err);
        if (err) {
            var error = {
                response: {
                    message: constants.responseMessage.SOMETHING_WRONG,
                    data: {}
                },
                statusCode: constants.STATUS_CODE.SERVER_ERROR
            };
            return callback(error);
        } else
            return callback(null);
    });

}

function createThumbnailImage(path, name, callback) {
    var gm = require('gm').subClass({imageMagick: true});
    var thumbPath = path + 'thumb/' + "Thumb_" + name;
    //var tmp_path = path + "-tmpPath"; //will be put into a temp directory
    gm(path + name)
        .resize(40, 40, "!")
        .autoOrient()
        .write(thumbPath, function (err, data) {
            //console.error(err);
            //console.log(data);
            if (err) {
                // console.error("HERE: ",err);
                var error = {
                    response: {
                        message: constants.responseMessage.SOMETHING_WRONG,
                        data: {}
                    },
                    statusCode: constants.STATUS_CODE.SERVER_ERROR
                };
                return callback(error);
            } else {
                return callback(null);
            }
        })
}


exports.uploadFile = function (otherConstants, fileDetails, createThumbnail, callbackParent) {
    var filename = fileDetails.name;
    var TEMP_FOLDER = otherConstants.TEMP_FOLDER;
    var s3Folder = otherConstants.s3Folder;
    var file = fileDetails.file;
    var mimiType = file.hapi.headers['content-type'];
    async.waterfall([
        function (callback) {
            saveFile(file, TEMP_FOLDER + filename, callback);
        },
        function (callback) {
            if (createThumbnail)
                createThumbnailImage(TEMP_FOLDER, filename, callback);
            else
                callback(null);
        },
        function (callback) {
            var fileObj = {
                path: TEMP_FOLDER,
                name: filename,
                thumbName: "Thumb_" + filename,
                mimeType: mimiType,
                s3Folder: s3Folder
            };
            if (createThumbnail)
                fileObj.s3FolderThumb = otherConstants.s3FolderThumb;
            initParallelUpload(fileObj, createThumbnail, callback);
        }
    ], function (error) {
        if (error)
            callbackParent(error);
        else
            callbackParent(null);
    })
};

function initParallelUpload(fileObj, withThumb, callbackParent) {

    async.parallel([
        function (callback) {
            uploadImageToS3Bucket(fileObj, false, callback);
        },
        function (callback) {
            if (withThumb)
                uploadImageToS3Bucket(fileObj, true, callback);
            else
                callback(null);
        }
    ], function (error) {
        if (error)
            callbackParent(error);
        else
            callbackParent(null);
    })

}


console.log("A+++++++++++++", config.iOSPushSettings);

// ios push notification
exports.sendApplePushNotification123 = function (iosDeviceToken, message, flag, title) {

    console.log("IN...... sendApplePushNotification123");


    var apns = require('apn');

    var options = {
        cert: 'BulBulck.pem',
        certData: null,
        key: 'BulBulck.pem',
        keyData: null,
        passphrase: 'click',
        ca: null,
        pfx: null,
        pfxData: null,
        gateway: 'gateway.push.apple.com',
        port: 2195,
        rejectUnauthorized: true,
        enhanced: true,
        cacheLength: 100,
        autoAdjustCache: true,
        connectionTimeout: 0,
        ssl: true
    };

    var apnsConnection = new apns.Connection(options);
    var note = new apns.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 0;
    note.sound = 'ping.aiff';
    note.alert = message;
    note.payload  = {"title":title,"message":message,"flag":flag} ;


    apnsConnection.pushNotification(note, iosDeviceToken);


    // i handle these events to confirm the notification gets
    // transmitted to the APN server or find error if any

    function log(type) {
        return function () {
            console.log(type, arguments);
        }
    }

    apnsConnection.on('transmitted', function (err,result) {
        console.log("err #####", err);
        console.log("result ####", result);
    });

    apnsConnection.on('error', log('error'));
    apnsConnection.on('transmitted', log('transmitted'));
    apnsConnection.on('timeout', log('timeout'));
    apnsConnection.on('connected', log('connected'));
    apnsConnection.on('disconnected', log('disconnected'));
    apnsConnection.on('socketError', log('socketError'));
    apnsConnection.on('transmissionError', log('transmissionError'));
    apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
};







module.exports.calculateDistance = calculateDistance;
module.exports.sortArray = sortArray;
module.exports.distanceBetween = distanceBetween;
module.exports.isContains = isContains;
module.exports.getTodayAndTomorrow = getTodayAndTomorrow;
module.exports.contains = contains;
module.exports.distanceBetweenTwoCoordinates = distanceBetweenTwoCoordinates;
module.exports.getLocalAndUtcTime = getLocalAndUtcTime;
module.exports.formatDateTime = formatDateTime;
module.exports.createHashFromObjectArray = createHashFromObjectArray;
module.exports.getEndDate = getEndDate;
module.exports.deleteFile = deleteFile;
module.exports.saveFile = saveFile;
module.exports.createThumbnailImage = createThumbnailImage;
module.exports.uploadImageToS3Bucket = uploadImageToS3Bucket;
module.exports.generateFilenameWithExtension = generateFilenameWithExtension;
module.exports.sendHtmlContent = sendHtmlContent;
module.exports.sendAndroidPushNotification = sendAndroidPushNotification;
module.exports.sendIosPushNotification = sendIosPushNotification;