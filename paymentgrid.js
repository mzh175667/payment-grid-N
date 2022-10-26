const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const expressValidator = require("express-validator");
const app = express();
const port = process.env.PORT || 4002;
const path = require("path");

// DATABASE CONNECTION
const knex = require("./knex/knex.js");

knex
  .raw("SELECT 1")
  .then(() => {
    console.log("DATABASE CONNECTED");
  })
  .catch((e) => {
    console.log("DATABASE NOT CONNECTED");
    console.error(e);
  });

// MIDDLEWARES
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "/public")));

// IMPORT ROUTES
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");
const virtualTerminalRoutes = require("./routes/virtualTerminal");
const customerRoutes = require("./routes/customer");
const dashboardRoutes = require("./routes/dashboard");
const paymentRoutes = require("./routes/payments");
const invoiceRoutes = require("./routes/invoice");
const helperRoutes = require("./routes/helpers");
const permissionRoutes = require("./routes/permission");
const rolePermissionRoutes = require("./routes/rolePermission");
const roleRoutes = require("./routes/role");

// ROUTES MIDDLEWARE
app.use(apiRoutes);
app.use("/api", authRoutes);
app.use("/api", virtualTerminalRoutes);
app.use("/api", customerRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", paymentRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", helperRoutes);
app.use("/test", testRoutes);
app.use("/api", permissionRoutes);
app.use("/api", rolePermissionRoutes);
app.use("/api", roleRoutes);

// Default Route
app.use(function (req, res) {
  return res.status(404).json({
    message: "Route not found :)",
  });
});

app.listen(port, () => {
  console.log(`Server is up and  running on port ${port}`);
});
