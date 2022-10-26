const roleTable = "role_permission";
const moment = require("moment-timezone");
const Helpers = require("./Helpers");
let timeZone = process.env.TIME_ZONE;
const knex = require("../knex/knex.js");

function getAllRoles(user) {
  return new Promise(async function (resolve, reject) {
    let roles = [];
    let status = 500;

    await knex(roleTable)
      .then((response) => {
        roles = response;
        status = 200;
      })
      .catch((error) => {
        console.log("Role get error : ", error);
        Helpers.errorLogging("Role get error : " + error);
        status = 500;
      });

    resolve({
      status: status,
      roles,
    });
  });
}

function getAllRoleWithPermissions(user) {
  return new Promise(async function (resolve, reject) {
    let roles = [];
    let object = {};
    let newObject = {};
    let status = 500;

    await knex(roleTable)
      .leftJoin("roles", "roles.id", "role_permission.role_id")
      .leftJoin(
        "permissions",
        "permissions.id",
        "role_permission.permission_id"
      )
      .groupBy("role_id")
      .select(
        "role_permission.id as id",
        "roles.id as role_id",
        "permissions.id as permission_id",
        "roles.uuid as role_uuid",
        "roles.name as role_name",
        "roles.description",
        "role_permission.previliges",
        "permissions.name as permission_name",
        "permissions.core_permission",
        "role_permission.created_at"
      )
      .then((response) => {
        response.map((item, index) => {
          newObject.id = item.id;
          newObject.role_name = item.role_name;
          newObject.role_uuid = item.role_uuid;
          newObject.description = item.description;
          newObject.permission_name = item.permission_name;
          newObject.core_permission = item.core_permission;
          newObject.permission_id = item.permission_id;
          newObject.role_id = item.previliges;

          console.log(composed);
          if (!Object.hasOwn(object, item.role_id)) {
            object[item.role_id] = [newObject];
          } else if (Object.hasOwn(item, item.role_id)) {
            object[item.role_id].push(newObject);
          }
        });
        roles = response;
        console.log("object", newObject);
        status = 200;
      })
      .catch((error) => {
        console.log("Role get error : ", error);
        Helpers.errorLogging("Role get error : " + error);
        status = 500;
      });
    // await knex(roleTable)
    //   .leftJoin(
    //     "permissions",
    //     "permissions.id",
    //     "role_permission.permission_id"
    //   )
    //   .options({ nestTables: true })
    //   .select(
    //     "role_permission.id as id",
    //     "permissions.id as permission_id",
    //     "role_permission.previliges",
    //     "permissions.name as permission_name",
    //     "permissions.core_permission",
    //     "role_permission.role_id",
    //     "role_permission.created_at"
    //   )
    //   .then((response) => {
    //     roles = response;
    //     status = 200;
    //   })
    //   .catch((error) => {
    //     console.log("Role get error : ", error);
    //     Helpers.errorLogging("Role get error : " + error);
    //     status = 500;
    //   });

    resolve({
      status: status,
      roles,
    });
  });
}

function deleteRole(deleteId, user) {
  return new Promise(async function (resolve, reject) {
    let status = 500;

    await knex(roleTable)
      .where("uuid", deleteId)
      .delete()
      .then((response) => {
        status = 200;
      })
      .catch((error) => {
        console.log("Role delete error : ", error);
        Helpers.errorLogging("Role delete error : " + error);
        status = 500;
      });

    resolve({
      status: status,
    });
  });
}

module.exports = {
  getAllRoles,
  deleteRole,
  getAllRoleWithPermissions,
};
