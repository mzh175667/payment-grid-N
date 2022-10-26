const Configs = require('./config');

exports.provider = Configs.emailProvider;
exports.hostName = Configs.emailHostName;
exports.port = Configs.emailPort;
exports.isSecure = Configs.emailIsSecure; // true for 465, false for other ports
exports.username = Configs.emailUserName;
exports.password = Configs.emailPassword;
exports.fromEmail = Configs.emailFromEmail;

// mail configuration for sendmail
exports.sendMailNewline = 'unix'; // either ‘windows’ or ‘unix’ (default). Forces all newlines in the output to either use Windows syntax <CR><LF> or Unix syntax <LF>
exports.sendMailPath = '/usr/sbin/sendmail'; //  path to the sendmail command (defaults to ‘sendmail’)

exports.newAccountRegisterationCode =
    'Payment Grid - New Account Registeration Code';
exports.forgetPasswordResetLink = 'Payment Grid - Forget Password Reset Link';

exports.facebookUrl = '#';
exports.linkedInUrl = '#';
exports.twitterUrl = '#';
exports.instagramUrl = '#';
