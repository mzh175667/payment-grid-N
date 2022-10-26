const roleTable = "roles";
const rolePermissionTable = "role_permission";
const moment = require("moment-timezone");
const Helpers = require("./Helpers");
let timeZone = process.env.TIME_ZONE;
const knex = require("../knex/knex.js");

async function createRolePermission(inputs) {
  return new Promise(async function (resolve, reject) {
    let permissionInput = JSON.parse(inputs.permission);
    console.log("inputs", permissionInput);
    let name = inputs.name;
    let description = inputs.description;
    let permission_id = inputs.permission_id;
    let previliges = inputs.previliges;
    let status = 500;
    let getUuid = "";
    let currentDateTime = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");

    let permissionId = "";
    await Helpers.getUuid().then((response) => {
      getUuid = response;
    });

    let roleInsert = {
      name,
      description,
      created_at: currentDateTime,
      updated_at: currentDateTime,
      uuid: getUuid,
    };

    await knex(roleTable)
      .insert(roleInsert)
      .then((response) => {
        roleId = response[0];
        status = 200;
      })
      .catch((error) => {
        console.log("Role create error : ", error);
        Helpers.errorLogging("Role create error : " + error);
        status = 500;
      });
    let assignRoleToPermissionInsert;
    permissionInput.map(async (item, i) => {
      for (let [key, value] of Object.entries(item)) {
        console.log("key", key);
        console.log("value", value);
        assignRoleToPermissionInsert = {
          role_id: roleId,
          permission_id: parseInt(key),
          previliges: JSON.stringify(value),
          created_at: currentDateTime,
          updated_at: currentDateTime,
        };
        status = await saveRolePermission(assignRoleToPermissionInsert);
        console.log("status", status);
      }
    });

    resolve({
      status: status,
    });
  });
}

async function saveRolePermission(assignRoleToPermissionInsert) {
  return new Promise(async function (resolve, reject) {
    console.log("obj", assignRoleToPermissionInsert);
    let status;
    await knex(rolePermissionTable)
      .insert(assignRoleToPermissionInsert)
      .then((response) => {
        status = 200;
      })
      .catch((error) => {
        console.log("RolePermission  create error : ", error);
        Helpers.errorLogging("RolePermission create error : " + error);
        status = 500;
      });
    resolve(status);
  });
}

module.exports = {
  createRolePermission,
};
