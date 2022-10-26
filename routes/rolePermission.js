const express = require("express");
const router = express.Router();

const {
  createRolePermission,
  //   getAllPermissions,
  //   updatePermission,
  //   deletePermission,
  //   getPermissionByUuid,
} = require("../controllers/RolePermissionController");

// router.get("/get-all-permissions", getAllPermissions);
// router.get("/get-permission/:id", getPermissionByUuid);
router.post("/assign-role-to-permission", createRolePermission);
// router.put("/update-permission/:id", updatePermission);
// router.delete("/delete-permission/:id", deletePermission);

module.exports = router;
