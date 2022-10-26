require("dotenv").config();
const RolePermissions = require("../models/RolePermission");
const Helpers = require("../models/Helpers");
const { paginateArray } = require("../utils");

// CREATE ROLE / ASSIGN ROLE TO PERMISSION
exports.createRolePermission = async (req, res) => {
  console.log("body", req.body);
  try {
    let status = 500;
    let inputs = req.body;

    await RolePermissions.createRolePermission(inputs)
      .then((response) => {
        status = response.status;
      })
      .catch((error) => {
        console.log("RolePermission create error : " + error);
        Helpers.errorLogging("RolePermission create error : " + error);
      });

    return res.status(200).json(status);
  } catch (error) {
    console.log("RolePermission create error : " + error);
    Helpers.errorLogging("RolePermission create error : " + error);
  }
};
