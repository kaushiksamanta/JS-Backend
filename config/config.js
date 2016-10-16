'use strict';

module.exports = {
    db: {
        production   : "mongodb://54.186.74.153:27017/fastVan_prod",
        development  : "mongodb://localhost/fastVan_local",
        staging      : "mongodb://localhost/fastVan_staging",
        test         : "mongodb://localhost/fastVan_test"
    },
    mailer: {
        auth: {
            user: 'qavinod@clicklabs.in',
            pass: 'vinodrawat'
        },
        service: 'Gmail'
    },
    "emailCredentials": {
        "host": "smtp.mandrillapp.com",
        "port": 587,
        "senderEmail": "cofounder@mashaweeruae.com",  //taximustgr@gmail.com
        "multipleSupportEmailIds": "​'magicgeniea2z@gmail.com'",      //'taximustgr@gmail.com'
        "From": "noreply@fastvan.com",
        "apiKey": "X9NvVHZHdOFZk1OIkcNj5w"
    },
    "paymentCredentials" : {
        userId   : "8a8294174e735d0c014e78cf266b1794",
        password : "qyyfHCN83e",
        entityId : "8a8294174e735d0c014e78cf26461790"
    },
    emailCredentialsGmail : {
        "service": "gmail",
        "user"   : "ajeet@clicklabs.in",
        "pass"   : "ajeet12345",
        "from"   : "ajeet@clicklabs.in"
    },
    twilioCredentials : {
        accountSID  : "ACd61d3edd5c28e57b16a7d3727b3e61d2",
        authToken   : "2275a70b2c66213c6f411389c82d0ab8",
        FromNumber : "+14154291568"
    },
    iOSPushSettings: {
        iosApnCertificate: "certs/apn/fastVan_Dev_Push.pem",
        gateway: "gateway.push.apple.com",
        gateway1: "sandbox.push.apple.com"
    },
    pushCredentials: {
        iosGateway: "gateway.sandbox.push.apple.com",
        pemFile : "certs/apn/fastVan_Dev_Push.pem",
        androidKey : "AIzaSyDeYS8VdLH6EmtQ-1391-ntt2axv8Ox-mM"
    },
    androidPushSettings: {
        brandName   : "Fastvan",
        gcmSender   : "AIzaSyBEbZmhTNI3wlZqaYCoOMb6qUXfustHncs",
        gcmSenderCP : "AIzaSyCtRs4zCcJWT9d9fMutZcrLZzBdxxYY8Xs"
    },
    socialInfo : {
        facebookId : "www.facebookfastvan.com",
        twitterId  : "www.twitterfastvan.com",
        googleId   : "www.googlefastvan.com",
        contactId  : "+912222222222"
    },
    "s3BucketCredentials": {
        "bucket": "fastvans",
        "accessKeyId": "AKIAJX2WK6J4P5UC7TYQ",
        "secretAccessKey": "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",
        "s3URL": "http://fastvans.s3.amazonaws.com",
        "folder" : {
            "customer" : "customer",
            "driver"   : "driver"
        }
    },
    server: {
        port: {
            dev     : 8000,
            staging : 8001,
            test    : 8002
        }
    }
};
