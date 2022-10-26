require("dotenv").config();
const Permissions = require("../models/Permissions");
const Helpers = require("../models/Helpers");
const { paginateArray } = require("../utils");

// CREATE PERMISSIONS
exports.createPermission = async (req, res) => {
  console.log("body", req.body);
  try {
    let status = 500;
    let inputs = req.body.permission;

    await Permissions.createPermission(inputs)
      .then((response) => {
        status = response.status;
      })
      .catch((error) => {
        console.log("Permission create error : " + error);
        Helpers.errorLogging("Permission create error : " + error);
      });

    return res.status(200).json(status);
  } catch (error) {
    console.log("Permission create error : " + error);
    Helpers.errorLogging("Permission create error : " + error);
  }
};

// UPDATE PERMISSIONS
exports.updatePermission = async (req, res) => {
  try {
    let status = 500;
    let permissionId = req.params.id;
    let inputs = req.body;

    await Permissions.updatePermission(inputs, permissionId)
      .then((response) => {
        status = response.status;
      })
      .catch((error) => {
        console.log("Permission update error : " + error);
        Helpers.errorLogging("Permission update error : " + error);
      });

    return res.status(200).json(status);
  } catch (error) {
    console.log("Permission update error : " + error);
    Helpers.errorLogging("Permission update error : " + error);
  }
};

// GET ALL PERMISSIONS
exports.getAllPermissions = async (req, res) => {
  try {
    let status = 500;
    let user = req.user;
    let document = [];
    let allData = [];
    let total = 0;
    let { page, limit } = req.query;
    console.log("req.query", req.query);
    await Permissions.getAllPermissions(user, page, limit)
      .then((response) => {
        status = response.status;
        document = response.permissions;
        allData = response.allData;
        total = response.total;
      })
      .catch((error) => {
        console.log("Permission get error : " + error);
        Helpers.errorLogging("Permission get error : " + error);
      });

    return res.status(200).json({
      message: "Permissions Found Successfully!",
      status,
      data: { allData, permissions: document, total },
    });
  } catch (error) {
    console.log("Permission get error : " + error);
    Helpers.errorLogging("Permission get error : " + error);
  }
};

// GET PERMISSION BY ID
exports.getPermissionByUuid = async (req, res) => {
  try {
    let status = 500;
    let user = req.user;
    let id = req.params.id;
    let document = {};
    await Permissions.getPermissionByUuid(user, id)
      .then((response) => {
        status = response.status;
        document = response.permission;
      })
      .catch((error) => {
        console.log("Invoice by UUid error : " + error);
        Helpers.errorLogging("Permission by UUid error : " + error);
      });

    return res.status(200).json({ status, document });
  } catch (error) {
    console.log("Permission by UUid error : " + error);
    Helpers.errorLogging("Permission by UUid error : " + error);
  }
};

// DELETE PERMISSION
exports.deletePermission = async (req, res) => {
  try {
    let status = 500;
    let user = req.user;
    let deleteId = req.params.id;
    await Permissions.deletePermission(deleteId, user)
      .then((response) => {
        status = response.status;
      })
      .catch((error) => {
        console.log("Permission delete error : " + error);
        Helpers.errorLogging("Permission delete error : " + error);
      });
    return res.status(200).json(status);
  } catch (error) {
    console.log("Default Api error : " + error);
    Helpers.errorLogging("Default Api error : " + error);
  }
};
