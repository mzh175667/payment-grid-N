const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  verifyToken,
  verifyEmail,
  newVerificationCode,
  resetLink,
  resetPassword,
} = require("../controllers/AuthController");

const {
  isLoggedIn,
  requireSignin,
  parseToken,
} = require("../middlewares/auth");

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/verify-email", verifyEmail);
router.post("/auth/get-verify-code", newVerificationCode);
router.post("/auth/reset-link", resetLink);
router.post("/auth/reset-password", resetPassword);
router.post("/auth/refresh-token", verifyToken);
router.get("/auth/logout", logout);

// TEST ROUTE FOR TOKEN AND MIDDLEWARES
router.post("/hello", parseToken, requireSignin, isLoggedIn, (req, res) => {
  console.log("HELLO");
  console.log(req.auth);
  console.log(req.user);
});

module.exports = router;
