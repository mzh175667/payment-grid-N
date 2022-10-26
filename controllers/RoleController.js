require("dotenv").config();
const Roles = require("../models/Role");
const Helpers = require("../models/Helpers");
const { paginateArray } = require("../utils");

// GET ALL ROLE
exports.getAllRoles = async (req, res) => {
  try {
    let status = 500;
    let user = req.user;
    let document = [];
    await Roles.getAllRoles(user)
      .then((response) => {
        status = response.status;
        document = response.roles;
      })
      .catch((error) => {
        console.log("Role get error : " + error);
        Helpers.errorLogging("Role get error : " + error);
      });

    return res.status(200).json(document);
  } catch (error) {
    console.log("Role get error : " + error);
    Helpers.errorLogging("Role get error : " + error);
  }
};

// GET ALL ROLE WITH PERMISSIONS
exports.getAllRoleWithPermissions = async (req, res) => {
  try {
    let status = 500;
    let user = req.user;
    let document = [];
    await Roles.getAllRoleWithPermissions(user)
      .then((response) => {
        status = response.status;
        document = response.roles;
      })
      .catch((error) => {
        console.log("Role get error : " + error);
        Helpers.errorLogging("Role get error : " + error);
      });

    return res
      .status(200)
      .json({ message: "Roles Found Successfully!", status, data: document });
  } catch (error) {
    console.log("Role get error : " + error);
    Helpers.errorLogging("Role get error : " + error);
  }
};

// DELETE PERMISSION
exports.deleteRole = async (req, res) => {
  try {
    let status = 500;
    let user = req.user;
    let deleteId = req.params.id;
    await Roles.deleteRole(deleteId, user)
      .then((response) => {
        status = response.status;
      })
      .catch((error) => {
        console.log("Role delete error : " + error);
        Helpers.errorLogging("Role delete error : " + error);
      });
    return res.status(200).json(status);
  } catch (error) {
    console.log("Default Api error : " + error);
    Helpers.errorLogging("Default Api error : " + error);
  }
};
