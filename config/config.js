require("dotenv").config();

let environment = process.env.NODE_ENV;

// Google Map Api Key
let googleMapApiKey = "AIzaSyBO6iFKPbb8aZnXSk3rDINcb2INWRFMvjU";

// APP URLS
let BASE_URL = process.env.BASE_URL;
let FRONT_URL = process.env.FRONT_URL;

// TEST STRIPE API KEYS
let StripeAPIKey =
  "pk_test_51IZho8BXL7x68C9pBB1DYuIA1E97RM3wNvvXitpaXRYENKAHftxS9p1Fw4uRbMMU8COvP12ZoOamneX2KUQVIYMU00ZL1XE642";
let StripeSecretKey =
  "sk_test_51IZho8BXL7x68C9pHkDZJg0pfJ4BTaD2kLkQEBPb0Jd3r4LZO4OMo8FezXRTMtucc5rcE83AtjrGkeFYxnEPm6Ig008eCSTSP2";

// EMAIL SETTINGS
let emailProvider = process.env.EMAIL_PROVIDER;
let emailHostName = process.env.EMAIL_HOSTNAME;
let emailFromEmail = process.env.EMAIL_FROM_EMAIL;
let emailUserName = process.env.EMAIL_USERNAME;
let emailPassword = process.env.EMAIL_PASSWORD;
let emailIsSecure = process.env.EMAIL_IS_SECURE;
let emailPort = process.env.EMAIL_PORT;

module.exports = {
  environment,
  googleMapApiKey,
  BASE_URL,
  FRONT_URL,
  emailProvider,
  emailHostName,
  emailFromEmail,
  emailUserName,
  emailPassword,
  emailIsSecure,
  emailPort,
  StripeAPIKey,
  StripeSecretKey,
};
