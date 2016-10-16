
var constants = require('../utilities/constants'),
    log4js    = require('log4js'),
    logger    = log4js.getLogger('[DAO]');


/*
 ----------------------------------------
 TO SAVE DATA
 ----------------------------------------
 */
exports.save = function (model, data, cb) {

    console.log("IN .....SAVE");
    new model(data).save(function (err, resultData) {

        console.log("err", err);
        console.log("resultData", resultData);


        if (err) {
            //logger.error("SET DATA: ", err);

            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };
            cb(errResponse);
        }
        else {
            console.log("else");
            var result = resultData.toObject();
            delete result.__v;
            cb(null, result);
        }
    });
};

/*
 ----------------------------------------
 TO FIND MULTIPLE DATA
 ----------------------------------------
 */
exports.find = function (model, query, projection, options, cb) {

    model.find(query, projection, options, function (err, data) {
        if (err) {
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            return cb(errResponse);
        }
        else {
            return cb(null, data);
        }
    });
};

/*
 ----------------------------------------
 TO FIND SINGLE DATA
 ----------------------------------------
 */
exports.findOne = function (model, query, projection, cb) {

    model.findOne(query, projection, function (err, data) {
        if (err) {
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            return cb(errResponse);
        }
        else {
            return cb(null, data);
        }
    });
};

/*
 ----------------------------------------
 TO FIND DATA FROM MULTIPLE COLLECTION
 ----------------------------------------
 */

exports.getAndPopulateData = function (model,query,projection,option,populateQuery, callback) {

    model.find(query, projection, option).populate(populateQuery).exec( function (err, data) {

        if (err) {
            console.log("=====getAndPopulateData error=====");
            console.log(err);
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 500
            };

            callback(errResponse);
        }
        else {
            callback(null, data);
        }
    })
};


/*
 ----------------------------------------
 GET DISTINCT DATA
 ----------------------------------------
 */
exports.getDistinctData = function (model, field, condition, cb) {
    model.distinct(field, condition, function (error, result) {
        if (error) {
            response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: constants.STATUS_CODE.BAD_REQUEST
            };
            return cb(errResponse);
        }
        return cb(null, result);
    })
};


/*
 ----------------------------------------
 GET DATA WITH REFERENCE
 ----------------------------------------
 */
exports.getDataWithReference = function (model, query, projection, collectionOptions, cb) {
    model.find(query).select(projection).populate(collectionOptions).exec(function (err, data) {

        if (err) {
            logger.error("Error Data reference: ", err);
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            cb(errResponse);
        }
        else {

            cb(null, data);
        }
    });
};





/*
 ---------------------------------------------------------------------------------------------
 WARNING: Not a general module just for category-sub-service tree or for two level tree only
 ---------------------------------------------------------------------------------------------
 */
exports.getDataDeepPopulate = function (model, query, projection,options, populateModelName, nestedModel, cb) {

    model.find(query, projection, options).populate(populateModelName)
        .exec(function (err, docs) {

            if (err) return cb(err);

            model.populate(docs, nestedModel,
                function (err, populatedDocs) {
                    if (err) return cb(err);
                    cb(null, populatedDocs);// This object should now be populated accordingly.
                });
        });
};



exports.aggregateData = function (model, group, cb) {

    model.aggregate(group, function (err, data) {

        if (err) {
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            cb(errResponse);
        }
        else {
            cb(null, data);
        }
    });
};


/*
 ----------------------------------------
 TO UPDATE THE DATA
 ----------------------------------------
 */

exports.update = function (model, conditions, update, options, cb) {

    model.update(conditions, update, options, function (err, result) {
        var errResponse, response;

        if (err) {
            logger.error("Update Query: ", err);
            response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            return cb(errResponse);
        }
        //logger.trace("Update Result: ", JSON.stringify(result));
        //if (!result) {
        //    response = {
        //        message: constants.responseMessage.NO_DATA,
        //        data: {}
        //    };
        //    errResponse = {
        //        response: response,
        //        details: err,
        //        statusCode: 400
        //    };
        //
        //    return cb(errResponse);
        //
        //}
        //if (result.n === 0 || result.nModified === 0) {
        //    response = {
        //        message: constants.responseMessage.NO_DATA,
        //        data: {}
        //    };
        //    errResponse = {
        //        response: response,
        //        details: err,
        //        statusCode: 400
        //    };
        //
        //    return cb(errResponse);
        //}


        return cb(null, result);

    });
};

/*
 ----------------------------------------
 DELETE DATA
 ----------------------------------------
 */
exports.deleteData = function (model, conditions, cb) {

    model.remove(conditions, function (err, removed) {
        var errResponse, response;

        if (err) {

            response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            return cb(errResponse);
        }
        if (!removed || removed.result.n == 0) {

            response = {
                message: constants.responseMessage.NO_DATA,
                data: {}
            };
            errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            return cb(errResponse);

        }

        logger.info("DELETE query: ", removed.result);
        return cb(null, result);


    });
};



/*
 ----------------------------------------
 BATCH INSERT
 ----------------------------------------
 */
exports.batchInsert = function (model, batchData, cb) {
    model.collection.insert(batchData, function (error, docs) {

        if (error) {
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: error,
                statusCode: 400
            };

            cb(errResponse);
        }
        else {
            cb(null, docs);
        }
    });
};
/*
 ----------------------------------------
 BATCH UPSERT WARNING: not a general query
 ----------------------------------------
 */
exports.batchUpsert = function (model, batchData, cb) {


    var bulk = model.collection.initializeOrderedBulkOp();
    var counter = 0;
    var len = batchData.length;
    var recordsChanged = {};
    // representing a long loop
    for (var i = 0; i < len; i++) {
        var service = batchData[i].service;
        var serviceProvider = batchData[i].serviceProvider;
        var query = {
            service: service,
            serviceProvider: serviceProvider
        };
        bulk.find(query).upsert().updateOne(batchData[i]);
        /* update conditions */

        counter++;

        if (counter % len == 0)
            bulk.execute(function (err, result) {
                if (err) {
                    var response = {
                        message: constants.responseMessage.ERROR_IN_EXECUTION,
                        data: {}
                    };
                    var errResponse = {
                        response: response,
                        details: error,
                        statusCode: 400
                    };

                    return cb(errResponse);
                } else {
                    recordsChanged = result.toJSON();
                    logger.trace("BATCH UPSERT: ", recordsChanged);
                    bulk = model.collection.initializeOrderedBulkOp();
                    return cb(null, recordsChanged);
                }
            });

    }

    if (counter % len != 0)
        bulk.execute(function (err, result) {
            logger.trace("BATCH UPSERT OUT: ", err);
            if (err) {
                var response = {
                    message: constants.responseMessage.ERROR_IN_EXECUTION,
                    data: {}
                };
                var errResponse = {
                    response: response,
                    details: error,
                    statusCode: 400
                };

                return cb(errResponse);
            } else {
                recordsChanged = result.toJSON();
                logger.trace("BATCH UPSERT OUT: ", result);
                return cb(null, recordsChanged);
            }
        });
}
;

exports.getCount = function (model, condition, cb) {
    model.count(condition, function (error, count) {
        if (error) {
            logger.error("Error Get Count: ", err);
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };
            return cb(errResponse);
        }
        return cb(null, count);
    })
};

/*
 ----------------------------------------
 UPDATE DATA And return count
 ----------------------------------------
 */
exports.updateAndReturnCount = function (model, conditions, update, options, cb) {

    model.update(conditions, update, options, function (err, result) {
        var errResponse, response;

        if (err) {
            logger.error("Update Query: ", err);
            response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            return cb(errResponse);
        }
        logger.trace("Update Result: ", JSON.stringify(result));
        return cb(null, result);

    });
};




// Find and sort records

exports.findLastRecords = function(model, condition, keyToSortWithNegativeSign, cb) {


    model.find(condition).sort(keyToSortWithNegativeSign).limit(1).exec(function(err, data){
        if (err) {
            var response = {
                message: constants.responseMessage.ERROR_IN_EXECUTION,
                data: {}
            };
            var errResponse = {
                response: response,
                details: err,
                statusCode: 400
            };

            return cb(errResponse);
        }
        else {
            return cb(null, data);
        }

    });
};





