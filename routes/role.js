const express = require("express");
const router = express.Router();

const {
  getAllRoles,
  deleteRole,
  getAllRoleWithPermissions,
} = require("../controllers/RoleController");

router.get("/get-all-roles", getAllRoles);
router.get("/get-all-roles-permissions", getAllRoleWithPermissions);
router.delete("/delete-role/:id", deleteRole);

module.exports = router;
