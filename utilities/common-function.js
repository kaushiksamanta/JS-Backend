var request           = require('request'),
    constants         = require('./constants'),
    dbConstants       = require('./dbConstants'),
    DAO               = require('../dao/DAO'),
    momentTimezone    = require('moment-timezone'),
    config            = require('../config/config'),
    async             = require('async'),
    models            = require('../models'),
    gcm               = require('node-gcm'),
    debugging_enabled = true,
    apns              = require('apn'),
    nodemailer        = require('nodemailer'),
    fs                = require('node-fs'),
    AWS               = require('aws-sdk'),
    moment            = require('moment'),
    md5               = require('MD5'),
    _                 = require('underscore'),
    log4js            = require('log4js'),
    logger            = log4js.getLogger('[UTIL]'),
    smtpTransport     = undefined,
    Path              = require('path'),
    mongoose          = require('mongoose');

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

            DAO.find(model, condition, projection, options, callback);


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


/*
 ==========================================================
 Send the notification to the iOS device for customer
 ==========================================================
 */

exports.sendIosPushNotification = function (deviceToken, text, notificationType, details) {
    console.log(details);

    details.notificationType = notificationType;
    details.brandName = config.androidPushSettings.brandName;

    console.log(config.iOSPushSettings.iosApnCertificate);
    console.log(config.iOSPushSettings.gateway);

    var status = 1;
    var msg = text;
    var snd = 'ping.aiff';

    var options = {
        cert: config.iOSPushSettings.iosApnCertificate,
        certData: null,
        key: config.iOSPushSettings.iosApnCertificate,
        keyData: null,
        passphrase: 'click',
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

    var deviceToken = new apns.Device(deviceToken);
    var apnsConnection = new apns.Connection(options);
    var note = new apns.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.contentAvailable = true;
    note.sound = snd;
    note.alert = msg;
    note.newsstandAvailable = status;

    note.payload = {message: details};

    apnsConnection.pushNotification(note, deviceToken);

    // Handle these events to confirm that the notification gets
    // transmitted to the APN server or find error if any
    function log(type) {
        return function () {
            if (debugging_enabled)
                console.log("iOS PUSH NOTIFICATION RESULT: " + type);
        }
    }

    apnsConnection.on("transmissionError", function(errCode, notification, device) {
        console.error("Notification caused error: " + errCode + " for device ", device.token.toString("hex"), notification);

    });

    apnsConnection.on('error', log('error'));
    apnsConnection.on('transmitted', log('transmitted'));
    apnsConnection.on('timeout', log('timeout'));
    apnsConnection.on('connected', log('connected'));
    apnsConnection.on('disconnected', log('disconnected'));
    //   apnsConnection.on('socketError', log('socketError'));
    //  apnsConnection.on('transmissionError', log('transmissionError'));
    apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));

};

// send apple push notification demo

exports.sendApplePushNotificationDemo = function (iosDeviceToken, message, payload) {
    var apns = require('apn');
    var deviceCount = iosDeviceToken.length;
    console.log(iosDeviceToken);
    if (deviceCount != 0) {
        var options = {
            cert: config.pushCredentials.pemFile,   //config.get('pushCredentialsForCp.pemFile'),
            certData: null,
            key: config.pushCredentials.pemFile,
            keyData: null,
            passphrase: 'click',
            ca: null,
            pfx: null,
            pfxData: null,
            gateway:  config.pushCredentials.pemFile.iosGateway, //config.get('pushCredentialsForCp.iosGateway'),
            port: 2195,
            rejectUnauthorized: true,
            enhanced: true,
            cacheLength: 100,
            autoAdjustCache: true,
            connectionTimeout: 0,
            ssl: true
        };

        for (var i = 0; i < deviceCount; i++) {
            //console.log('deviceToken' + iosDeviceToken[i])
            if (iosDeviceToken[i] != '' && iosDeviceToken[i] != 0) {


                var deviceToken1 = iosDeviceToken[i].replace(/[^0-9a-f]/gi, "");

                if ((deviceToken1.length) % 2) {
                    //console.log("error")
                }
                else {

                    var deviceToken = new apns.Device(iosDeviceToken[i]);
                    var apnsConnection = new apns.Connection(options);
                    var note = new apns.Notification();

                    note.expiry = Math.floor(Date.now() / 1000) + 3600;
                    note.badge = 0;
                    note.sound = 'ping.aiff';
                    note.alert = message;
                    note.payload  = payload;

                    apnsConnection.pushNotification(note, deviceToken);

                    function log(type) {
                        return function () {
                            console.log(type, arguments);
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
                }
            }
        }
    }
};

// Third
exports.sendIosPushNotificationDemo12345 = function (deviceToken, text, notificationType, details) {

    console.log("IN ...... sendIosPushNotificationDemo12345");


    console.log(details);

    details.notificationType = "MY NOTIFICATION TYPE";
    details.brandName        = "FASTVAN";


    console.log(config.iOSPushSettings.iosApnCertificate);
    console.log(config.iOSPushSettings.gateway);

    var status = 1;
    var msg = text;
    var snd = 'ping.aiff';

    var options = {
        cert: "fastVan_Dev_Push.pem",
        certData: null,
        key: "fastVan_Dev_Push.pem",
        keyData: null,
        passphrase: 'click',
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

    var deviceToken = new apns.Device(deviceToken);
    var apnsConnection = new apns.Connection(options);
    var note = new apns.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.contentAvailable = true;
    note.sound = snd;
    note.alert = msg;
    note.newsstandAvailable = status;

    note.payload = {message: details};

    apnsConnection.pushNotification(note, deviceToken);

    // Handle these events to confirm that the notification gets
    // transmitted to the APN server or find error if any
    function log(type) {
        return function () {
            if (debugging_enabled)
                console.log("iOS PUSH NOTIFICATION RESULT: " + type);
        }
    }

    apnsConnection.on("transmissionError", function(errCode, notification, device) {
        console.error("Notification caused error: " + errCode + " for device ", device.token.toString("hex"), notification);

    });

    apnsConnection.on('error', log('error'));
    apnsConnection.on('transmitted', log('transmitted'));
    apnsConnection.on('timeout', log('timeout'));
    apnsConnection.on('connected', log('connected'));
    apnsConnection.on('disconnected', log('disconnected'));
    //   apnsConnection.on('socketError', log('socketError'));
    //  apnsConnection.on('transmissionError', log('transmissionError'));
    apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));

};



//function sendIosPushNotification(iosDeviceToken, message, payload) {
//
//    console.log(payload);
//
//
//    console.log(config.iOSPushSettings.gateway);
//    var certificate = Path.resolve(".") + config.iOSPushSettings.iosApnCertificate;
//    logger.info("IOS certi: ", certificate);
//    //if (payload.address) {
//    //    payload.address = '';
//    //}
//    var status = 1;
//    var msg = message;
//    var snd = 'ping.aiff';
//    //if (flag == 4 || flag == 6) {
//    //    status = 0;
//    //    msg = '';
//    //    snd = '';
//    //}
//
//
//    var options = {
//        cert: certificate,
//        certData: null,
//        key: certificate,
//        keyData: null,
//        passphrase: 'Serv2Day',
//        ca: null,
//        pfx: null,
//        pfxData: null,
//        gateway: config.iOSPushSettings.gateway,
//        port: 2195,
//        rejectUnauthorized: true,
//        enhanced: true,
//        cacheLength: 100,
//        autoAdjustCache: true,
//        connectionTimeout: 0,
//        ssl: true
//    };
//
//
//    // var deviceToken = new apns.Device(iosDeviceToken[0]);
//    var apnsConnection = new apns.Connection(options);
//    var note = new apns.Notification();
//
//    note.expiry = Math.floor(Date.now() / 1000) + 3600;
//    note.contentAvailable = 1;
//    note.sound = snd;
//    note.alert = msg;
//    note.newsstandAvailable = status;
//    note.payload = {message: payload};
//
//    // apnsConnection.pushNotification(note, deviceToken);
//    _.each(iosDeviceToken, function (token) {
//        logger.trace(token);
//        if (!token || token == "(null)" || token == "deviceToken") {
//            logger.error("IOS PUSH ERROR with Token: ", token);
//        } else {
//            var device = new apns.Device(token);
//            apnsConnection.pushNotification(note, device);
//        }
//    });
//    // Handle these events to confirm that the notification gets
//    // transmitted to the APN server or find error if any
//    function log(type) {
//        return function () {
//            if (debugging_enabled)
//                console.log("iOS PUSH NOTIFICATION RESULT: " + type);
//        }
//    }
//
//    apnsConnection.on('error', log('error'));
//    apnsConnection.on('transmitted', log('transmitted'));
//    apnsConnection.on('timeout', log('timeout'));
//    apnsConnection.on('connected', log('connected'));
//    apnsConnection.on('disconnected', log('disconnected'));
//    apnsConnection.on('socketError', log('socketError'));
//    apnsConnection.on('transmissionError', log('transmissionError'));
//    apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
//
//};

/*
 ==============================================
 Send the notification to the android device
 =============================================
 */
//function sendAndroidPushNotification(deviceTokens, text, flag) {
//
//    var message = new gcm.Message({
//        collapseKey: 'demo',
//        delayWhileIdle: false,
//        timeToLive: 2419200,
//        data: {
//            message: text,
//            flag: flag,
//            brand_name: config.androidPushSettings.brandName
//        }
//    });
//    var sender = new gcm.Sender(config.androidPushSettings.gcmSender);
//    //var registrationIds = [];
//    //registrationIds.push(deviceToken);
//
//    sender.send(message, deviceTokens, 4, function (err, result) {
//        if (debugging_enabled) {
//            console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(result));
//            console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
//        }
//    });
//}


// To send android push notification
exports.sendAndroidPushNotification = function (deviceToken, text, notificationType, details) {

    console.log("IN....  sendAndroidPushNotification");

    var gcm = require('node-gcm');

    details.message = text;
    details.notificationType = notificationType;
    details.brandName = config.androidPushSettings.brandName;

    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 15000,
        data: {results: details}
    });

    console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(message));

    var sender = new gcm.Sender(config.androidPushSettings.gcmSender);
    var registrationIds = [];
    registrationIds.push(deviceToken);

    console.log(registrationIds);

    sender.send(message, registrationIds, 4, function (err, result) {
        console.log("err ###########", err);
        console.log("result ########", result);

        if (debugging_enabled) {
            console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(result));
            console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
        }
    });
};

// To send push notification to the customere
exports.sendAndroidPushNotificationCP = function (deviceToken, text, notificationType, details) {

    console.log("IN....  sendAndroidPushNotificationCP");

    var gcm = require('node-gcm');

    details.message = text;
    details.notificationType = notificationType;
    details.brandName = config.androidPushSettings.brandName;

    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 15000,
        data: {results: details}
    });

    console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(message));

    var sender = new gcm.Sender(config.androidPushSettings.gcmSenderCP);
    var registrationIds = [];
    registrationIds.push(deviceToken);

    console.log(registrationIds);

    sender.send(message, registrationIds, 4, function (err, result) {
        console.log("err ###########", err);
        console.log("result ########", result);

        if (debugging_enabled) {
            console.log("ANDROID NOTIFICATION RESULT: " + JSON.stringify(result));
            console.log("ANDROID NOTIFICATION ERROR: " + JSON.stringify(err));
        }
    });
};


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


exports.getTimestamp = function (inDate) {
    if (inDate)
        return new Date();
    else
        return new Date().toISOString();
};

exports.getDate = function (date) {
    return date.setMinutes(date.getMinutes() + constants.TIMEZONE_OFFSET);
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


exports.cryptData = function (data) {
    return md5(data);
};

//=========
//=========

exports.failAction                       = function(request, reply, source, error, cb) {
    var customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation
    return cb(error);
};


exports.failActionFunction = function (request, reply, source, error, cb) {

    if (error.isBoom) {
        delete error.output.payload.validation;
        delete error.output.payload.error;
        delete error.output.payload.statusCode;

        if (error.output.payload.message.indexOf("authorization") !== -1) {
            error.output.statusCode = STATUS_CODE.UNAUTHORIZED;
            // error.output.payload.statusCode = STATUS_CODE.UNAUTHORIZED;
            return reply(error);
        }
        var details = error.data.details[0];
        if (details.message.indexOf("pattern") > -1 && details.message.indexOf("required") > -1 && details.message.indexOf("fails") > -1) {
            error.output.payload.message = "Invalid " + details.path;
            return reply(error);
        }
    }
    var customErrorMessage = '';
    if (error.output.payload.message.indexOf("[") > -1) {
        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
    } else {
        customErrorMessage = error.output.payload.message;
    }
    customErrorMessage = customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage.replace(']', '');
    error.output.payload.message = customErrorMessage;
    delete error.output.payload.validation;
    delete error.output.payload.error;
    delete error.output.payload.statusCode;
    return cb(error);
};



exports.checkAuthorizedUserByAccessToken = function(accessToken, userType, callback) {
    var query      = {accessToken : accessToken},
        projection = {
                        accessToken:1,
                        email:1,
                        isDeleted:1,
                        isBlocked:1
                    },
        collectionName;

    if(userType === dbConstants.userType.ADMIN || userType === dbConstants.userType.SUPER_ADMIN) {
        collectionName = models.admin;

    } else if(userType === dbConstants.userType.CUSTOMER) {
        collectionName = models.customer;

    } else if(userType === dbConstants.userType.DRIVER) {
        collectionName = models.driver;
    }

    DAO.findOne(collectionName, query, projection, function(err, userData) {
        if(err) {
            return callback(err);
        } else {
            var error = {};
            if(userData === null) {
                error.response = {
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                    message    : constants.responseMessage.INVALID_ACCESS_TOKEN,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.UNAUTHORIZED;
                return callback(error);
            } else if(userData.isDeleted === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.FORBIDDEN,
                    message    : constants.responseMessage.USER_DELETED,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.FORBIDDEN;
                return callback(error);
            } else if(userData.isBlocked === true) {
                error.response = {
                    statusCode : constants.STATUS_CODE.FORBIDDEN,
                    message    : constants.responseMessage.USER_BLOCKED,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.FORBIDDEN;
                return callback(error);
            }
            else {
                return callback(null, userData);
            }
        }
    });
};

function generateFilenameWithExtension(oldFilename, newFilename) {
    var ext = oldFilename.substr((~-oldFilename.lastIndexOf(".") >>> 0) + 2);
    return newFilename + '.' + ext;
}

exports.uploadProfilePicture             = function(profilePicture, folder, filename, callbackParent) {
    var baseFolder = folder + '/' + config.s3BucketCredentials.folder.profilePicture;
    var baseURL = config.s3BucketCredentials.s3URL + '/' + baseFolder + '/';
    var urls = {};

    async.waterfall([
            function (callback) {
                var profileFolder = config.s3BucketCredentials.folder.original;
                var profileFolderThumb = config.s3BucketCredentials.folder.thumb;
                var profilePictureName = generateFilenameWithExtension(profilePicture.hapi.filename, "Profile_" + filename);
                var s3Folder = baseFolder + '/' + profileFolder;
                var s3FolderThumb = baseFolder + '/' +  profileFolderThumb;

                var profileFolderUploadPath = "customer/profilePicture";
                var path = Path.resolve("..") + "/uploads/" + profileFolderUploadPath + "/";

                var fileDetails = {
                    file: profilePicture,
                    name: profilePictureName
                };
                var otherConstants = {
                    TEMP_FOLDER: path,
                    s3Folder: s3Folder,
                    s3FolderThumb: s3FolderThumb
                };
                urls.profilePicture = baseURL + profileFolder + '/' + profilePictureName;
                urls.profilePictureThumb = baseURL + profileFolderThumb + '/Thumb_' + profilePictureName;
                util.uploadFile(otherConstants, fileDetails, true, callback);

            }
        ],
        function (error) {
            if (error)
                callbackParent(error);
            else
                callbackParent(null, urls);
        })
};

exports.sendEmailFromGmailAccount        = function(receiverMailId, message, subject, callback) {

    var nodemailer    = require("nodemailer");
    var smtpTransport = require('nodemailer-smtp-transport');
    var transporter   = nodemailer.createTransport(smtpTransport({
        service: config.emailCredentialsGmail.service,        //config.get('emailCredentials.service'),
        auth: {
            user: config.emailCredentialsGmail.user,         //config.get('emailCredentials.user'),
            pass: config.emailCredentialsGmail.pass         //config.get('emailCredentials.pass')
        }}));
    var mailOptions = {
        from: config.emailCredentialsGmail.from,          //config.get('emailCredentials.from'), // sender address
        to: receiverMailId, // list of receivers
        subject: subject, // Subject line
        text: message
        //html: "<b>Hello world ?</b>" // html body
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error)
            return callback(0);
        } else {
            console.log(info)
            return callback(1);
        }

    });
}

exports.sendPlainTextEmail               = function (to, message, subject, callback) {
    console.log("IN : email function......");
    if (smtpTransport === undefined) {
        smtpTransport = nodemailer.createTransport({
            host: config.emailCredentials.host,
            port: config.emailCredentials.port,
            auth: {
                user: config.emailCredentials.senderEmail,
                pass: config.emailCredentials.apiKey
            }

        });
    }


    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: config.emailCredentials.From, // sender address
        //from: config.get('emailCredentials.From'), // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: message // plaintext body
        //html: "<b>Hello world ?</b>" // html body
    };

    // send mail with defined transport object
    if (to.length > 0) {

        smtpTransport.sendMail(mailOptions, function (error, response) {

            console.log("Sending Mail Error: " + JSON.stringify(error));
            console.log("Sending Mail Response: " + JSON.stringify(response));
            if (error) {
                return callback(0);
            } else {
                return callback(1);
            }
        });
    }
};

exports.checkFbUser                      = function(fbId, fbAccessToken, cb) {
    var error = {};
    var request = require('request');
    var urls = "https://graph.facebook.com/" + fbId + "?fields=updated_time&access_token=" + fbAccessToken;

    console.log(urls);
    request(urls, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var output = JSON.parse(body);
            if (output['error']) {
                error.response = {
                    statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                    message    : constants.responseMessage.UNAUTHORIZED_FB_ACCESS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.UNAUTHORIZED;
                cb(error);
            }
            else {
                console.log("Successfull fb sig up....");
                cb(null, 1);
            }
        }
        else {
            var error11 = {};
            error11.response = {
                statusCode : constants.STATUS_CODE.UNAUTHORIZED,
                message    : constants.responseMessage.INVALID_FB_USER,
                data       : []
            };
            error11.statusCode = constants.STATUS_CODE.UNAUTHORIZED;
            cb(error11);
        }
    });
};

exports.randomString                     = function(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
};

exports.createJsonFromPayload            = function (payload) {
    var data = {};
    for (var key in payload) {
        if (payload.hasOwnProperty(key) && payload[key]) {
            data[key] = payload[key];
        }
    }
    return data;
};


exports.getLocalTimestamp                = function () {
    var now = new Date();
    now.setMinutes(now.getMinutes() + constants.TIMEZONE_OFFSET);
    return now.toISOString();
};
/*
 return date in UTC format Eg:(2015-04-29 06:24:40) from local (Wed Apr 29 2015 11:54:40 GMT+0530 (IST))
 */
exports.getUTCDate                      = function () {
    return new Date().toISOString();
};

exports.checkValidEndTime = function(startTime, endTime, cb) {
    console.log("IN", startTime, endTime);


    if(startTime > endTime) {
        console.log("IF");

        var error = {};
        error.response = {
            statusCode : constants.STATUS_CODE.BAD_REQUEST,
            message : constants.responseMessage.END_TIME_ERROR,
            data    : []
        };
        error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
        cb(error)
    } else {
        console.log("ELSE");
        cb(null, endTime);
    }
};

exports.generateVericationToken = function(cb) {
    cb(null, Math.floor(Math.random() * 899999 + 100000));
};

exports.sendMessageFromTwilio = function(to_number, body_content, cb) {
    console.log("IN.... sendMessageFromTwilio");

    var client = require('twilio')(config.twilioCredentials.accountSID, config.twilioCredentials.authToken);
    client.messages.create({
        to   : to_number,
        from : config.twilioCredentials.FromNumber,
        body : body_content
    }, function(err, message) {
        console.log("err===", err);
        console.log("message===", message);
        if(err) {
            var error = {};
            error.response = {
                statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                message    : constants.responseMessage.ERROR_OTP_SEND,
                data       : {}
            };
            error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
            cb(null, error);
        } else {
            cb(null, message);
        }
    });
};


exports.checkExistsEntity = function(collection, _id, callback) {
    console.log("IN..... checkExistsVehicleId", _id);

    async.waterfall([
            function(cb) {
                if(mongoose.Types.ObjectId.isValid(_id)) {
                    cb(null, _id);
                } else {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.BAD_REQUEST,
                        message    : constants.responseMessage.INVALID_ID,
                        data       : {}
                    };
                    error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                    cb(error);
                }
            },
            function(_id, cb) {
                var query      = {_id : _id},
                    projection = {_id : 1};
                DAO.findOne(collection, query, projection, cb);
            },
            function(entityInfo, cb) {
                if(entityInfo === null) {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.BAD_REQUEST,
                        message    : constants.responseMessage.ID_NOT_EXISTS,
                        data       : {}
                    };
                    error.statusCode = constants.STATUS_CODE.BAD_REQUEST;
                    cb(error);
                } else {
                    cb(null, entityInfo);
                }
            }
        ],
        function(error, result) {
            if(error) {
                callback(error);
            } else {
                callback(null, result);
            }
        });
};




//function checkAppVersion(enteredVersion, user, deviceType, callback) {
//
//    console.log("IN ......checkAppVersion" , enteredVersion, "::", user, "::", deviceType);
//
//    var collection;
//    if(user === dbConstants.appVersionFor.CUSTOMER) {
//        collection = models.customerAppVersion;
//    } else if(user === dbConstants.appVersionFor.DRIVER) {
//        collection = models.driverAppVersion;
//    }
//
//    async.waterfall([
//        function(cb) {
//            var query      = {deviceType : deviceType},
//                projection = {};
//            DAO.findOne(collection, query, projection, cb);
//        },
//        function(appVersionData, cb) {
//            var updateVersion,
//                sameVersion;
//
//            if(appVersionData.currentVersion > parseInt(enteredVersion)) {
//                updateVersion.updatePopupFlag = 1;
//                updateVersion.updateMessage   = appVersionData.updateMessage;
//                updateVersion.forceUpdate     = appVersionData.forceUpdate;
//                cb(null, updateVersion);
//            } else {
//                sameVersion.updatePopupFlag = 0;
//                sameVersion.updateMessage   = appVersionData.updateMessage;
//                sameVersion.forceUpdate     = appVersionData.forceUpdate;
//                cb(null, sameVersion);
//            }
//        }
//    ],
//    function(error, result) {
//        if(error) {
//            callback(error);
//        } else {
//            callback(null, result);
//        }
//    });
//}
//
//
//checkAppVersion(100, dbConstants.appVersionFor.CUSTOMER, dbConstants.devices.ANDROID, function(error, result) {
//    console.log("error", error);
//    console.log("result", result);
//});

//function validateTimezone(timezone) {
//    console.log("IN... ", timezone);
//    var result = moment.tz.zone(timezone);
//    return _.isEmpty(result);
//}



// send apple push notification

exports.sendApplePushNotification123 = function (iosDeviceToken, message, flag, title) {

    console.log("IN...... sendApplePushNotification123");

    var apns = require('apn');

    var options = {
        cert: "FastVan_Dev_Push.pem",
        certData: null,
        key: "FastVan_Dev_Push.pem",
        keyData: null,
        passphrase: 'click',
        ca: null,
        pfx: null,
        pfxData: null,
        gateway: "gateway.sandbox.push.apple.com",
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







module.exports.sortArray = sortArray;
module.exports.getLocalAndUtcTime = getLocalAndUtcTime;
module.exports.formatDateTime = formatDateTime;
module.exports.uploadImageToS3Bucket = uploadImageToS3Bucket;
module.exports.sendHtmlContent = sendHtmlContent;
//module.exports.sendAndroidPushNotification = sendAndroidPushNotification;
//module.exports.sendIosPushNotification = sendIosPushNotification;