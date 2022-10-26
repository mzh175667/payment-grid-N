const nodeMailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const MailConfig = require('../config/Mail');
const Configs = require('../config/config');
const Helpers = require('../models/Helpers');

/**
 * Mail function list
 * 1) newAccountRegisterationCode
 * 2) sendEmailResetLink
 *
 * @type {string}
 */

const mailProvider = MailConfig.provider;
let mailTransPorter = {};
if (mailProvider === 'gmail') {
    mailTransPorter = {
        service: mailProvider,
        host: MailConfig.hostName,
        port: MailConfig.port,
        secure: MailConfig.isSecure, // true for 465, false for other ports
        auth: {
            user: MailConfig.username,
            pass: MailConfig.password,
        },
    };
} else if (mailProvider === 'smtp') {
    mailTransPorter = {
        host: MailConfig.hostName,
        port: MailConfig.port,
        secure: MailConfig.isSecure, // true for 465, false for other ports
        auth: {
            user: MailConfig.username,
            pass: MailConfig.password,
        },
        tls: { rejectUnauthorized: false },
    };
} else {
    mailTransPorter = {
        sendmail: true,
        newline: MailConfig.sendMailNewline,
        path: MailConfig.sendMailPath,
    };
}

let transporter = nodeMailer.createTransport(mailTransPorter);

const options = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: './views/mail_templates',
        layoutsDir: './views/mail_templates',
        defaultLayout: 'layout.hbs',
    },
    viewPath: './views/mail_templates',
    extName: '.hbs',
};

function sendMailToUser(toEmail, subject, template, mailContent) {
    return new Promise(function (resolve, reject) {
        transporter.use('compile', hbs(options));
        transporter
            .sendMail({
                from: 'Payment Grid ' + MailConfig.username,
                to: toEmail,
                subject: subject,
                template: template,
                context: mailContent,
            })
            .then((response) => {
                resolve(response);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
}

let mailCall = {
    /**
     * Send mail for vendor employee create by admin/vendor
     * @param data
     * @returns {Promise<void>}
     */
    newAccountRegisterationCode: async (data) => {
        try {
            let subject = MailConfig.newAccountRegisterationCode;
            let toEmail = data.email;

            let mailContent = {
                name: data.name,
                email: data.email,
                code: data.code,
                url: Configs.BASE_URL,
                frontUrl: Configs.FRONT_URL,
                supportEmail: Configs.support_email,
                facebookUrl: MailConfig.facebookUrl,
                linkedInUrl: MailConfig.linkedInUrl,
                twitterUrl: MailConfig.twitterUrl,
                instagramUrl: MailConfig.instagramUrl,
            };

            await sendMailToUser(
                toEmail,
                subject,
                'registeration_code',
                mailContent
            )
                .then((response) => {
                    console.log('Code create : success : ' + toEmail);
                })
                .catch((err) => {
                    console.log('Code create : error : ' + err);
                    Helpers.errorLogging('Code create : error ' + err);
                });
        } catch (e) {
            console.log('Code create : exception : ', e);
            Helpers.errorLogging('Code create : exception ' + e);
        }
    },

    sendEmailResetLink: async (data) => {
        try {
            let subject = MailConfig.forgetPasswordResetLink;
            let toEmail = data.email;

            let mailContent = {
                name: data.name,
                email: data.email,
                reset_token: data.reset_token,
                url: Configs.BASE_URL,
                frontUrl: Configs.FRONT_URL,
                supportEmail: Configs.support_email,
                facebookUrl: MailConfig.facebookUrl,
                linkedInUrl: MailConfig.linkedInUrl,
                twitterUrl: MailConfig.twitterUrl,
                instagramUrl: MailConfig.instagramUrl,
            };

            await sendMailToUser(
                toEmail,
                subject,
                'forget_password',
                mailContent
            )
                .then((response) => {
                    console.log('Forget Password Link : success : ' + toEmail);
                })
                .catch((err) => {
                    console.log('Forget Password Link : error : ' + err);
                    Helpers.errorLogging('Forget Password Link : error ' + err);
                });
        } catch (e) {
            console.log('Forget Password Link : exception : ', e);
            Helpers.errorLogging('Forget Password Link : exception ' + e);
        }
    },
};

module.exports = mailCall;
