var devices = {};
devices.ANDROID = 'ANDROID';
devices.IOS = 'IOS';
devices.WEB = 'WEB';

var loginStatus = {};
loginStatus.ACTIVE   =  'ACTIVE';
loginStatus.DEACTIVE = 'DEACTIVE';

var userType              = {};
userType.ADMIN            = "ADMIN";
userType.SUPER_ADMIN      = "SUPER_ADMIN";
userType.CUSTOMER         = "CUSTOMER";
userType.DRIVER           = "DRIVER";

var customerType             = {};
customerType.BUSINESS_USER   = "BUSINESS_USER";
customerType.INDIVIDUAL_USER = "INDIVIDUAL_USER";

var paymentMode     = {};
paymentMode.CARD    = "CARD";
paymentMode.COD     = "COD";
paymentMode.CREDITS = "COD";

var collectPaymentAt               = {};
collectPaymentAt.PICKUP_LOCATION   = "PICKUP_LOCATION";
collectPaymentAt.DELIVERY_LOCATION = "DELIVERY_LOCATION";

var orderStatus                    = {};
orderStatus.TIMEOUT                = 'TIMEOUT';
orderStatus.PENDING                = 'PENDING';
orderStatus.ORDER_PLACED           = 'ORDER_PLACED';
orderStatus.QUOTE_SEND             = 'QUOTE_SEND';
orderStatus.QUOTE_IDLE             = 'QUOTE_IDLE';
orderStatus.QUOTE_ACCEPTED         = 'QUOTE_ACCEPTED';
orderStatus.DRIVER_ASSIGNED        = 'DRIVER_ASSIGNED';
orderStatus.DRIVER_ACCEPTED        = 'DRIVER_ACCEPTED';
orderStatus.REACHED_PICKUP_POINT   = 'REACHED_PICKUP_POINT';
orderStatus.PICKED_UP              = 'PICKED_UP';
orderStatus.REACHED_DELIVERY_POINT = 'REACHED_DELIVERY_POINT';
orderStatus.ORDER_DELIVERED        = 'ORDER_DELIVERED';
orderStatus.CANCELLED              = 'CANCELLED';
orderStatus.REFUND                 = 'REFUND';


var driverNotificationType                = {};
driverNotificationType.ORDER_REQUEST      = "ORDER_REQUEST";


var referralStatus       = {};
referralStatus.ACTIVE    = "ACTIVE";
referralStatus.EXPIRED   = "EXPIRED";
referralStatus.PENDING   = "PENDING";
referralStatus.CANCELLED = "CANCELLED";

var promoStatus       = {};
promoStatus.ACTIVE    = "ACTIVE";
promoStatus.EXPIRED   = "EXPIRED";
promoStatus.PENDING   = "PENDING";
promoStatus.CANCELLED = "CANCELLED";

var promoType      = {};
promoType.CREDIT   = "CREDIT";
promoType.DISCOUNT = "DISCOUNT";

var serviceType          = {};
serviceType.COURIER      = 'COURIER';
serviceType.REMOVAL      = 'REMOVAL';
serviceType.DELIVERY     = 'DELIVERY';
serviceType.ALL_SERVICES = 'ALL_SERVICES';

var vehicleType             = {};
vehicleType.VAN             = "VAN";
vehicleType.BIKE            = "BIKE";
vehicleType.THREE_TON_TRUCK = "THREE_TON_TRUCK";
vehicleType.FIVE_TON_TRUCK  = "FIVE_TON_TRUCK";
vehicleType.EIGHT_TON_TRUCK = "EIGHT_TON_TRUCK";

var additionalServiceType                     = {};
additionalServiceType.EXPRESS_DELIVERY        = 'EXPRESS_DELIVERY';
additionalServiceType.ENGLISH_SPEAKING_DRIVER = 'ENGLISH_SPEAKING_DRIVER';

var serviceScope           = {};
serviceScope.NATIONAL      = "NATIONAL";
serviceScope.INTERNATIONAL = "INTERNATIONAL";

var materialType      = {};
materialType.PARCEL   = 'PARCEL';
materialType.DOCUMENT = 'DOCUMENT';
materialType.OTHER    = 'OTHER';


var appVersionFor = {};
appVersionFor.CUSTOMER = "CUSTOMER";
appVersionFor.DRIVER   = "DRIVER";


var serviceTimeUnit   = {};
serviceTimeUnit.DAY   = "DAY";
serviceTimeUnit.HOURS = "HOURS";

var assignedStatus          = {};
assignedStatus.ASSIGNED     = "ASSIGNED";
assignedStatus.NOT_ASSIGNED = "NOT_ASSIGNED";

var notificationType                    = {};
notificationType.ORDER_CANCELLED        = "ORDER_CANCELLED";
notificationType.ORDER_DELIVERED        = "ORDER_DELIVERED";
notificationType.REACHED_PICK_UP_POINT  = "REACHED_PICK_UP_POINT";
notificationType.PICKED_UP              = "PICKED_UP";
notificationType.REACHED_DELIVERY_POINT = "REACHED_DELIVERY_POINT";
notificationType.SENDING_QUOTE          = "SENDING_QUOTE";

var quoteStatus = {};
quoteStatus.QUOTE_IDLE      = "QUOTE_IDLE";
quoteStatus.QUOTE_SEND      = "QUOTE_SEND";
quoteStatus.QUOTE_ACCEPTED  = "QUOTE_ACCEPTED";
quoteStatus.QUOTE_REJECTED  = "QUOTE_REJECTED";

var partnerQuote          = {};
partnerQuote.ACCEPTED     = "ACCEPTED";
partnerQuote.NOT_ACCEPTED = "NOT_ACCEPTED";

var rideRequest    = {};
rideRequest.ACCEPT = "ACCEPT";
rideRequest.REJECT = "REJECT";

var serviceAdditionalInfo             = {};
serviceAdditionalInfo.IMMEDIATE       = "IMMEDIATE";
serviceAdditionalInfo.SAME_DAY        = "SAME_DAY";
serviceAdditionalInfo.NEXT_DAY        = "NEXT_DAY";
serviceAdditionalInfo.ECONOMY         = "ECONOMY";
serviceAdditionalInfo.OVERNIGHT       = "OVERNIGHT";
serviceAdditionalInfo.HOURLY_RENT     = "HOURLY_RENT";
serviceAdditionalInfo.LABOUR_SERVICES = "LABOUR_SERVICES";


module.exports.devices                  = devices;
module.exports.loginStatus              = loginStatus;
module.exports.serviceType              = serviceType;
module.exports.additionalServiceType    = additionalServiceType;
module.exports.materialType             = materialType;
module.exports.userType                 = userType;
module.exports.customerType             = customerType;
module.exports.paymentMode              = paymentMode;
module.exports.orderStatus              = orderStatus;
module.exports.collectPaymentAt         = collectPaymentAt;
module.exports.notificationType         = notificationType;
module.exports.driverNotificationType   = driverNotificationType;
module.exports.referralStatus           = referralStatus;
module.exports.vehicleType              = vehicleType;
module.exports.promoStatus              = promoStatus;
module.exports.promoType                = promoType;
module.exports.serviceType              = serviceType;
module.exports.serviceScope             = serviceScope;
module.exports.appVersionFor            = appVersionFor;
module.exports.serviceTimeUnit          = serviceTimeUnit;
module.exports.assignedStatus           = assignedStatus;
module.exports.quoteStatus              = quoteStatus;
module.exports.partnerQuote             = partnerQuote;
module.exports.rideRequest              = rideRequest;
module.exports.serviceAdditionalInfo    = serviceAdditionalInfo;
