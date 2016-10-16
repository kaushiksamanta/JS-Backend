var mongoose    = require('mongoose'),
    dbConstants = require('../utilities/dbConstants'),
    Schema      = mongoose.Schema;

var parcelDropLocation = new Schema({
    dropLocationDetail    : {
        latitude    : {type: Number},
        longitude   : {type: Number},
        fullAddress : {type: String, required: true},
        details     : {type: String, required: true, default: ''},
        city        : {type: String, required: true, default: ''},
        state       : {type: String, default: ''},
        createdAt   : {type: Date,   default : Date.now},
        modifiedAt  : {type: Date}
    },
    parcelDetail          : {
        typeOfGood   : {type: String, required: true},
        descriptions : {type: String, required: true , default: ''},
        quantity     : {type: Number, required: true},
        weight       : {type: Number},
        weightUnit   : {type: String},
        dimensions   : {
            length     : {type : Number},
            width      : {type : Number},
            height     : {type : Number},
            heightUnit : {type : String}
        },
        imageUrl     : {type: String},
        createdAt    : {type: Date, default : Date.now},
        modifiedAt   : {type: Date}
    }
});

var order = new Schema({
    customerId            : {type : Schema.ObjectId, ref: 'customer', required : true},
    driverId              : {type : Schema.ObjectId, ref: 'driver'},
    vehicleId             : {type : Schema.ObjectId, ref: 'vehicle'},
    orderId               : {type : Number, ref: 'orderGenerator', required : true},
    serviceType           : {type : String, required: true,
                             enum: [
                                        dbConstants.serviceType.COURIER,
                                        dbConstants.serviceType.REMOVAL,
                                        dbConstants.serviceType.DELIVERY
                                    ]},
    vehicleType           : {type: String, enum: [
                                                    dbConstants.vehicleType.VAN,
                                                    dbConstants.vehicleType.BIKE,
                                                    dbConstants.vehicleType.THREE_TON_TRUCK,
                                                    dbConstants.vehicleType.FIVE_TON_TRUCK,
                                                    dbConstants.vehicleType.EIGHT_TON_TRUCK
                                                ]
                            },
    customerName          : {type: String},
    customerPhoneNo       : {
                                prefix      : {type: String},
                                phoneNumber : {type: Number}
                            },
    driverName            : {type: String},
    scheduledTime         : {type: Date},
    serviceAdditionalInfo : {type: String, enum: [
                                                    dbConstants.serviceAdditionalInfo.IMMEDIATE,
                                                    dbConstants.serviceAdditionalInfo.SAME_DAY,
                                                    dbConstants.serviceAdditionalInfo.NEXT_DAY,
                                                    dbConstants.serviceAdditionalInfo.ECONOMY,
                                                    dbConstants.serviceAdditionalInfo.OVERNIGHT,
                                                    dbConstants.serviceAdditionalInfo.HOURLY_RENT,
                                                    dbConstants.serviceAdditionalInfo.LABOUR_SERVICES
                                                ]},
    serviceScope          : {type: String, enum: [
                                                    dbConstants.serviceScope.NATIONAL,
                                                    dbConstants.serviceScope.INTERNATIONAL
                                                ]},
    note                  : {type: String, default: ''},
    currentQuotePrice     : {type: Number},
    currencyType          : {type: String},
    serviceTime  : {
        duration : {type: Number},
        timeUnit : {type: String, enum: [
                                            dbConstants.serviceTimeUnit.DAY,
                                            dbConstants.serviceTimeUnit.HOURS
                                        ]}
    },
    pickupLocation        : {
        latitude    : {type: Number},
        longitude   : {type: Number},
        fullAddress : {type: String, required: true},
        details     : {type: String, required: true, default: ''},
        city        : {type: String, required: true, default: ''},
        state       : {type: String, default: ''}
    },
    parcelDropLocationDetails : [parcelDropLocation],
    paymentMode               : { type: String, enum: [
                                                            dbConstants.paymentMode.CARD,
                                                            dbConstants.paymentMode.COD,
                                                            dbConstants.paymentMode.CREDITS
                                                      ]
                                },
    paymentStatus             : {type: Boolean, default: false},
    quoteStatus               : {type: String, default: dbConstants.quoteStatus.QUOTE_IDLE,
                                            enum: [
                                                dbConstants.quoteStatus.QUOTE_IDLE,
                                                dbConstants.quoteStatus.QUOTE_SEND,
                                                dbConstants.quoteStatus.QUOTE_ACCEPTED,
                                                dbConstants.quoteStatus.QUOTE_REJECTED
                                            ]
                                },
    collectPaymentAt          : {type: String, default: '',
                                 enum: [
                                             dbConstants.collectPaymentAt.PICKUP_LOCATION,
                                             dbConstants.collectPaymentAt.DELIVERY_LOCATION, ''
                                 ]
                                },
    requestStatus             : {type : String, default : dbConstants.orderStatus.TIMEOUT,
                                  enum : [
                                            dbConstants.orderStatus.TIMEOUT,dbConstants.orderStatus.PENDING,
                                            dbConstants.orderStatus.ORDER_PLACED,dbConstants.orderStatus.QUOTE_SEND,
                                            dbConstants.orderStatus.QUOTE_IDLE,dbConstants.orderStatus.QUOTE_ACCEPTED,
                                            dbConstants.orderStatus.DRIVER_ASSIGNED,dbConstants.orderStatus.REACHED_PICKUP_POINT,
                                            dbConstants.orderStatus.DRIVER_ACCEPTED,dbConstants.orderStatus.PICKED_UP,
                                            dbConstants.orderStatus.REACHED_DELIVERY_POINT,dbConstants.orderStatus.ORDER_DELIVERED,
                                            dbConstants.orderStatus.CANCELLED,dbConstants.orderStatus.REFUND
                                        ]
                                },
    adminAssignedStatus       : {type : String, default: dbConstants.assignedStatus.NOT_ASSIGNED,
                                 enum : [
                                            dbConstants.assignedStatus.ASSIGNED,
                                            dbConstants.assignedStatus.NOT_ASSIGNED
                                        ]
                                },
    isDeleted             : {type: Boolean, default: false},
    createdAt             : {type: Date, default : Date.now},
    modifiedAt            : {type: Date}
});

module.exports = mongoose.model('order', order);

