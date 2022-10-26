const permissionTable = "permissions";
const moment = require("moment-timezone");
const Helpers = require("./Helpers");
let timeZone = process.env.TIME_ZONE;
const knex = require("../knex/knex.js");

async function createPermission(inputs) {
  return new Promise(async function (resolve, reject) {
    let name = inputs.name;
    let core_permission = inputs.core_permission;
    let status = 500;
    let getUuid = "";
    let currentDateTime = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");

    // let permissionId = "";
    await Helpers.getUuid().then((response) => {
      getUuid = response;
    });

    let permissionInsert = {
      name,
      core_permission,
      created_at: currentDateTime,
      updated_at: currentDateTime,
      uuid: getUuid,
    };

    await knex(permissionTable)
      .insert(permissionInsert)
      .then((response) => {
        // permissionId = response[0];
        status = 200;
      })
      .catch((error) => {
        console.log("Permission create error : ", error);
        Helpers.errorLogging("Permission create error : " + error);
        status = 500;
      });

    resolve({
      status: status,
    });
  });
}

async function updatePermission(inputs, permissionId) {
  return new Promise(async function (resolve, reject) {
    let status = 500;
    let currentDateTime = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
    let permissionUpdate = {
      name: inputs.name,
      core_permission: inputs.core_permission,
      updated_at: currentDateTime,
    };
    await knex(permissionTable)
      .where("uuid", permissionId)
      .update(permissionUpdate)
      .then((response) => {
        status = 200;
      })
      .catch((error) => {
        console.log("Customer update error : ", error);
        Helpers.errorLogging("Customer update error : " + error);
        status = 500;
      });

    resolve({
      status: status,
    });
  });
}

function getAllPermissions(user, page, limit) {
  return new Promise(async function (resolve, reject) {
    let permissions = [];
    let allData = [];
    let total = 0;
    let status = 500;

    await knex(permissionTable)
      .limit(limit)
      .offset((page - 1) * limit)
      .then((response) => {
        permissions = response;
        status = 200;
      })
      .catch((error) => {
        console.log("Permission get error : ", error);
        Helpers.errorLogging("Permission get error : " + error);
        status = 500;
      });

    await knex(permissionTable)
      .then((response) => {
        allData = response;
        total = response.length;
        status = 200;
      })
      .catch((error) => {
        console.log("Permission get error : ", error);
        Helpers.errorLogging("Permission get error : " + error);
        status = 500;
      });

    resolve({
      status: status,
      permissions,
      allData,
      total,
    });
  });
}

function deletePermission(deleteId, user) {
  return new Promise(async function (resolve, reject) {
    let status = 500;

    await knex(permissionTable)
      .where("uuid", deleteId)
      .delete()
      .then((response) => {
        status = 200;
      })
      .catch((error) => {
        console.log("Permission delete error : ", error);
        Helpers.errorLogging("Permission delete error : " + error);
        status = 500;
      });

    resolve({
      status: status,
    });
  });
}

function getPermissionByUuid(user, permissionId) {
  return new Promise(async function (resolve, reject) {
    let permission = {};
    let status = 500;

    await knex(permissionTable)
      .where("uuid", permissionId)
      .then((response) => {
        permission = response[0];
        status = 200;
      })
      .catch((error) => {
        console.log("Permission get error : ", error);
        Helpers.errorLogging("Permission get error : " + error);
        status = 500;
      });

    resolve({
      status: status,
      permission,
    });
  });
}

module.exports = {
  createPermission,
  getPermissionByUuid,
  getAllPermissions,
  deletePermission,
  updatePermission,
};
