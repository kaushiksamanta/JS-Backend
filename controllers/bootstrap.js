var util        = require('../utilities/common-function'),
    async       = require('async'),
    DAO         = require('../dao/DAO'),
    dbConstants = require('../utilities/dbConstants'),
    constants   = require('../utilities/constants'),
    models      = require('../models'),
    _           = require('underscore');


function InitializeVehicle(vehicle, callback) {

    console.log("IN...... InitializeVehicle");

    async.waterfall(
        [
            function(cb) {
                var query      = {name : vehicle.name},
                    projection = {_id: 1, name: 1};

                DAO.findOne(models.vehicle, query, projection, cb);
            },
            function(preCheckData, cb) {
                if(preCheckData === null) {
                    cb(null, 100);
                } else {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                        message    : constants.responseMessage.VEHICLE_ALREADY_EXISTS,
                        data       : []
                    };
                    error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                    cb(error);
                }
            },
            function(arg1, cb) {
                DAO.save(models.vehicle, vehicle, cb);
            },
            function(vehicleSaved, cb) {
                console.log("Vehicle data successfully saved", vehicleSaved);
                cb(null, 100);
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

function InitializeAdditionalServiceData(additionalService, callback) {
    console.log("IN .... InitializeAdditionalServiceData", additionalService);


    async.waterfall(
        [
            function(cb) {
                var query      = {name: additionalService.name},
                    projection = {_id: 1, name : 1};
                DAO.findOne(models.additionalService, query, projection, cb);
            },
            function(preCheckData, cb) {
                if(preCheckData === null) {
                    cb(null, 100);
                } else {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                        message    : constants.responseMessage.ADDITIONAL_SERVICE_ALREADY_EXISTS,
                        data       : []
                    };
                    error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                    cb(error);
                }
            },
            function(arg1, cb) {
                DAO.save(models.additionalService, additionalService, cb);
            },
            function(saveAdditionalService, cb) {
                console.log("Additional service data successfully saved", cb);
                cb(null, 100);
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

function InitializeServiceScope(serviceScope, callback) {

    console.log("IN ....InitializeServiceScope", serviceScope);

    async.waterfall(
        [
            function(cb) {
                var query      = {name: serviceScope.name},
                    projection = {_id: 1, name : 1};
                DAO.findOne(models.serviceScope, query, projection, cb);
            },
            function(preCheckData, cb) {
                if(preCheckData === null) {
                    cb(null, 100);
                } else {
                    var error = {};
                    error.response = {
                        statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                        message    : constants.responseMessage.SERVICE_SCOPE_ALREADY_EXISTS,
                        data       : []
                    };
                    error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                    cb(error);
                }
            },
            function(arg1, cb){
                DAO.save(models.serviceScope, serviceScope, cb);
            },
            function(savedServiceScope, cb) {
                console.log("Service scope successfully saved", savedServiceScope);
                cb(null, 100);
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

function InitializeMaterial(material, callback) {

    console.log("IN InitializeMaterial ====== ", material);

    var vehicleId = [],
        query,
        projection,
        van,
        bike;

    async.waterfall([
        function(cb) {
            var query      = {name: material.name},
                projection = {_id: 1, name: 1};
            DAO.findOne(models.material, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.MATERIAL_ALREADY_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function (arg1, cb) {
            query = {name: "VAN"};
            projection = {_id: 1, name: 1};
            DAO.findOne(models.vehicle, query, projection, cb);
        },
        function (vanInfo, cb) {
            van = vanInfo;
            query = {name: "BIKE"};
            projection = {_id: 1, name: 1};
            DAO.findOne(models.vehicle, query, projection, cb);
        },
        function (bikeInfo, cb) {
            bike = bikeInfo;

            if (material.name === dbConstants.materialType.PARCEL) {
                vehicleId.push(van._id);
            } else if (material.name === dbConstants.materialType.DOCUMENT) {
                vehicleId.push(bike._id);

            } else if (material.name === dbConstants.materialType.OTHER) {
                vehicleId.push(van._id);
                vehicleId.push(bike._id);
            }
            material.vehicleId = vehicleId;
            DAO.save(models.material, material, cb);
        }

    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};

function InitializeService(service, callback) {

    console.log("IN....InitializeService", service);

    var vehicle,
        additionalService,
        serviceScope,
        material,
        removalVehicleInfo;

    async.waterfall([
        function(cb) {
            var query      = {name: service.name},
                projection = {_id: 1, name: 1};
            DAO.findOne(models.service, query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                cb(null, 100);
            } else {
                var error = {};
                error.response = {
                    statusCode : constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT,
                    message    : constants.responseMessage.SERVICE_ALREADY_EXISTS,
                    data       : []
                };
                error.statusCode = constants.STATUS_CODE.ALREADY_EXISTS_CONFLICT;
                cb(error);
            }
        },
        function (arg1, cb) {
            var query      = {},
                projection = {_id: 1, name: 1},
                options    = {};
            DAO.find(models.vehicle, query, projection, options, cb);
        },
        function (vehicleInfo, cb) {
            vehicle = vehicleInfo;
            var query = {},
                projection = {_id: 1, name: 1},
                options = {};
            DAO.find(models.additionalService, query, projection, options, cb);
        },

        function (additionalServiceInfo, cb) {
            additionalService = additionalServiceInfo;
            var query = {},
                projection = {_id: 1, name: 1},
                options = {};
            DAO.find(models.serviceScope, query, projection, options, cb);
        },
        function (serviceScopeInfo, cb) {
            serviceScope = serviceScopeInfo;
            var query = {},
                projection = {_id: 1, materialType: 1},
                options = {};
            DAO.find(models.material, query, projection, options, cb);
        },
        function (materialInfo, cb) {
            material = materialInfo;
            var removeBike = _.reject(vehicle, function (v) {
                return v.name === dbConstants.vehicleType.BIKE;
            });
            var removeVan = _.reject(removeBike, function (v) {
                return v.name === dbConstants.vehicleType.VAN;
            });
            cb(null, removeVan);
        },
        function (vehicleInfo, cb) {
            removalVehicleInfo = vehicleInfo;
            console.log("#######", service);

            if (service.name === dbConstants.serviceType.REMOVAL) {
                var vehicleId = _.pluck(removalVehicleInfo, '_id'),
                    additionalServiceId = _.pluck(additionalService, '_id');

                service.vehicleId = vehicleId;
                service.additionalServiceId = additionalServiceId;
            } else if (service.name === dbConstants.serviceType.COURIER) {
                var serviceScopeId = _.pluck(serviceScope, '_id');
                service.serviceScopeId = serviceScopeId;
            } else if (service.name === dbConstants.serviceType.DELIVERY) {
                var materialTypeId = _.pluck(material, '_id');
                service.materialId = materialTypeId;
            }
            console.log("#######", service);
            DAO.save(models.service, service, cb);
        }
    ], function (error, success) {
        if (error) {
            return callback(error);
        } else {
            return callback(null, success);
        }
    })
};

function bootstrapVehicleData(callback) {
    console.log("IN ...... bootStrapVehicle");

    var van           = {
        name     : dbConstants.vehicleType.VAN,
        details : "Nice to add " + dbConstants.vehicleType.VAN
    };
    var bike          = {
        name    : dbConstants.vehicleType.BIKE,
        details : "Nice to add " + dbConstants.vehicleType.BIKE
    };
    var threeTonTruck = {
        name    : dbConstants.vehicleType.THREE_TON_TRUCK,
        details : "Nice to add " + dbConstants.vehicleType.THREE_TON_TRUCK
    };
    var fiveTonTruck = {
        name    : dbConstants.vehicleType.FIVE_TON_TRUCK,
        details : "Nice to add " + dbConstants.vehicleType.FIVE_TON_TRUCK
    };
    var eightTonTruck = {
        name: dbConstants.vehicleType.EIGHT_TON_TRUCK,
        details: "Nice to add " + dbConstants.vehicleType.EIGHT_TON_TRUCK
    };

    async.waterfall(
        [
            function(cb) {
                InitializeVehicle(van, cb);
            },
            function(arg1, cb) {
                InitializeVehicle(bike, cb);
            },
            function(arg1, cb) {
                InitializeVehicle(threeTonTruck, cb);
            },
            function(arg1, cb) {
                InitializeVehicle(fiveTonTruck, cb);
            },
            function(arg1, cb) {
                InitializeVehicle(eightTonTruck, cb);
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

function bootstrapAdditionalServiceData (callback) {
    console.log("IN ..... bootstrapAdditionalServiceData");

    var expressDelivery = {
        name : dbConstants.additionalServiceType.EXPRESS_DELIVERY,
        cost : 10
    };

    var englishSpeakingDriver = {
        name : dbConstants.additionalServiceType.ENGLISH_SPEAKING_DRIVER,
        cost : 20
    };

    async.waterfall(
        [
            function(cb) {
                InitializeAdditionalServiceData(expressDelivery, cb);
            },
            function(arg1, cb) {
                InitializeAdditionalServiceData(englishSpeakingDriver, cb);
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

function bootstrapServiceScope(callback) {
    console.log("IN.. ... bootstrapServiceScope");

    var national = {
        name : dbConstants.serviceScope.NATIONAL
    };

    var international = {
        name : dbConstants.serviceScope.INTERNATIONAL
    };

    async.waterfall(
        [
            function(cb) {
                InitializeServiceScope(national, cb);
            },
            function(arg1, cb) {
                InitializeServiceScope(international, cb);
            }
        ],
        function(error, result) {
            if(error) {
                callback(error);
            } else {
                callback(null, result);
            }
        });


}

function bootstrapingMaterial(callback) {

    console.log("IN ....bootstrapingMaterial");


    var parcel = {
        name    : dbConstants.materialType.PARCEL,
        details : "Nice to add " + dbConstants.materialType.PARCEL
    };

    var document = {
        name    : dbConstants.materialType.DOCUMENT,
        details : "Nice to add " + dbConstants.materialType.DOCUMENT
    };

    var other = {
        name    : dbConstants.materialType.OTHER,
        details : "Nice to add " + dbConstants.materialType.OTHER
    };

    async.waterfall([
            function(cb) {
                InitializeMaterial(parcel, cb);
            },
            function(arg1, cb) {
                InitializeMaterial(document, cb);
            },
            function(arg1, cb) {
                InitializeMaterial(other, cb);
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

function bootstrapingServices(callback) {

    console.log("IN .... bootstrapingServices ");

    var courier = {
        name    : dbConstants.serviceType.COURIER,
        details : "Nice to add " + dbConstants.serviceType.COURIER
    };

    var removal = {
        name    : dbConstants.serviceType.REMOVAL,
        details : "Nice to add " + dbConstants.serviceType.REMOVAL
    };

    var delivery = {
        name    : dbConstants.serviceType.DELIVERY,
        details : "Nice to add " + dbConstants.serviceType.DELIVERY
    };

    async.waterfall(
        [
            function(cb) {
                InitializeService(courier, cb);
            },
            function(arg1, cb) {
                InitializeService(removal, cb);
            },
            function(arg1, cb) {
                InitializeService(delivery, cb);
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

function bootstrapData(callback){

    console.log("IN ...bootstrapData");

    async.waterfall([
            function(cb) {
                bootstrapVehicleData(cb);
            },
            function(arg1, cb) {
                bootstrapAdditionalServiceData(cb);
            },
            function(arg1, cb) {
                bootstrapServiceScope(cb);
            },
            function(arg1, cb) {
                bootstrapingMaterial(cb);
            },
            function(arg1, cb) {
                bootstrapingServices(cb);
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

function initiateBootstrap(callback) {
    console.log(" ====== INITIATING BOOTSTRAPING ========");

    async.waterfall(
    [
        function(cb) {
            var query      = {name : dbConstants.vehicleType.VAN},
                projection = {_id : 1, name : 1};
            DAO.findOne(models.vehicle,query, projection, cb);
        },
        function(preCheckData, cb) {
            if(preCheckData === null) {
                bootstrapData(cb);
            } else {
                cb(null, 100);
            }
        },
        function(result, cb) {
            var success = {
                response: {
                    statusCode : constants.STATUS_CODE.OK,
                    message    : constants.responseMessage.ACTION_COMPLETE,
                    data       : []
                },
                statusCode: constants.STATUS_CODE.OK
            };
            cb(null, success);
        }
    ],
    function(error, result) {
        if(error) {
            callback(error);
        } else {
            callback(null, result);
        }
    });

}

// TO INITIATE BOOTSTRAP SERVICE
initiateBootstrap(function(error, result) {
});

function initializeOrderId(callback) {
    console.log("========= INITIALIZING ORDER ID ==========");

    async.waterfall([
            function(cb) {
                var query      = {},
                    projection = {};
                DAO.findOne(models.orderGenerator, query, projection, cb);
            },
            function(orderGeneratorData, cb) {
                if(orderGeneratorData === null) {
                    DAO.save(models.orderGenerator, {}, cb);
                } else {
                    cb(null , 100);
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

// TO INITIATE ORDER ID
initializeOrderId(function(error, result) {
});

function initializeCustomerAppVersion(user, callback) {
    console.log(" ==== INITIALIZING APP VERSION DATA ====");

    var collection;

    if(user === dbConstants.appVersionFor.CUSTOMER) {
        collection = models.customerAppVersion;
    } else if(user === dbConstants.appVersionFor.DRIVER) {
        collection = models.driverAppVersion;
    }

    async.waterfall([
        function(cb) {
            var query      = {deviceType : dbConstants.devices.ANDROID},
                projection = {};
            DAO.findOne(collection, query, projection, cb);
        },
        function(androidVersionData, cb) {
            if(androidVersionData === null) {
                DAO.save(collection, {
                                        deviceType          : dbConstants.devices.ANDROID,
                                        currentVersion      : 100,
                                        updateMessage       : "New version is available",
                                        forceUpdate         : 0
                                      },
                                      cb
                         );
            } else {
                cb(null , androidVersionData);
            }
        },
        function(androidVersionData, cb) {
            var query      = {deviceType : dbConstants.devices.IOS},
                projection = {};
            DAO.findOne(collection, query, projection, cb);
        },
        function(IOSVersionData, cb) {
            if(IOSVersionData === null) {
                DAO.save(collection, {
                                        deviceType          : dbConstants.devices.IOS,
                                        currentVersion      : 100,
                                        updateMessage       : "New version is available",
                                        forceUpdate         : 0
                                    },
                                    cb
                        );
            } else {
                cb(null , IOSVersionData);
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

initializeCustomerAppVersion(dbConstants.appVersionFor.CUSTOMER, function(error, result) {
});

initializeCustomerAppVersion(dbConstants.appVersionFor.DRIVER, function(error, result) {
});










