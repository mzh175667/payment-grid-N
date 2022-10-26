const express = require("express");
const router = express.Router();

const {
  createPermission,
  getAllPermissions,
  updatePermission,
  deletePermission,
  getPermissionByUuid,
} = require("../controllers/PermissionController");

router.get("/get-all-permissions", getAllPermissions);
router.get("/get-permission/:id", getPermissionByUuid);
router.post("/create-permission", createPermission);
router.put("/update-permission/:id", updatePermission);
router.delete("/delete-permission/:id", deletePermission);

module.exports = router;
