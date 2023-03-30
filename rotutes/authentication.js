const { json } = require("body-parser");
const express = require("express");
// Route's Access
const router = express.Router();
// Validation's
const { check } = require("express-validator");
// Route
const {
  signout,
  signup,
  signin,
  profile,
} = require("../controller/authentication");

router.get("/signout", signout);
router.get("/profile", profile);

router.post(
  "/signup",
  json(),
  [
    check("userName", "userName should be atleast 3 Characters").isLength({
      min: 3,
    }),
    check("email", "email is required").isEmail(),
    check("password", "Password should be atleast 3 Characters").isLength({
      min: 3,
    }),
  ],
  signup,
);

router.post(
  "/signin",
  json(),
  [
    check("email", "email is required").isEmail(),
    check("password", "Password should be atleast 3 Characters").isLength({
      min: 3,
    }),
  ],
  signin,
);

module.exports = router;
