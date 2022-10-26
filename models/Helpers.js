require('dotenv').config();
const Configs = require('../config/config');
const moment = require('moment-timezone');
let time_zone = process.env.TIME_ZONE;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let userTable = 'users';
const fs = require('fs');
const knex = require('../knex/knex.js');

function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return (
            new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number
        );
    }
    return number + ''; // always return a string
}

function getUuid() {
    return new Promise(async function (resolve, reject) {
        let uuid = uuidv4();
        resolve(uuid);
    });
}

function encryptPassword(password) {
    return new Promise(async function (resolve, reject) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            resolve(hash);
        });
    });
}

function decryptPassword(password, hash) {
    return new Promise(async function (resolve, reject) {
        bcrypt.compare(password, hash, function (err, res) {
            if (res) {
                resolve(200);
            } else {
                resolve(300);
            }
        });
    });
}

function fileExist(filePath) {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.F_OK, (err) => {
            let status = 500;
            if (err) {
                return reject(err);
            } else {
                status = 1;
            }
            //file exists
            resolve(status);
        });
    });
}

function getRandomNumber(length = 6) {
    var text = '';
    var possible = '0123456789';
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function errorLogging(error) {
    let path = './logs';
    const fs = require('fs'); // Or `import fs from "fs";` with ESM
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    let dateToday = moment().format('DD-MM-YYYY');
    let logfilePath = './logs/' + dateToday + '.txt';
    if (!fs.existsSync(logfilePath)) {
        fs.createWriteStream(logfilePath);
    }
    let newError = '';
    newError +=
        '--------------------------------------------------------------------------';
    let dateTimeNow = moment().format('DD-MM-YYYY h:mm:ss A');
    newError += '\n';
    newError += dateTimeNow;
    newError += '\n';
    newError += error;
    newError += ' \n\n ';

    fs.appendFile(logfilePath, newError, function (err) {
        if (err) throw err;
    });
}

function maskify(cc) {
    return cc.replace(/.(?=.{4,}$)/g, '*');
}

function getUserData(uuid) {
    return new Promise(function (resolve, reject) {
        knex(userTable)
            .where('uuid', uuid)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

module.exports = {
    getUuid,
    encryptPassword,
    decryptPassword,
    fileExist,
    getRandomNumber,
    errorLogging,
    maskify,
    zeroFill,
};
