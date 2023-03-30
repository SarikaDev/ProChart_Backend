const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../models/authentication");
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.SECRET;

// signup === Creating a account
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()[0].msg,
    });
  }

  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, bcryptSalt);
    const createUser = await User.create({
      userName: req.body.userName,
      password: hashedPassword,
      email: req.body.email,
    });
    createUser
      .save()
      .then(user => {
        res.status(200).json({
          userDetails: user,
        });
      })
      .catch(err => {
        console.log("err at signup", err);
      });
  } catch (error) {
    if (error) {
      res.status(500).json({
        message: ` ${error.keyValue.email} has been taken`,
      });
    }
  }
};

// signin === Entering into the account
exports.signin = async (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()[0].msg,
    });
  }

  const foundUser = await User.findOne({ email });

  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (!passOk ?? false) {
      return res.status(400).json({
        err: "email and password do not match",
      });
    }
    // create token
    jwt.sign(
      { _id: req.body._id, userName: foundUser.userName },
      process.env.SECRET,
      {},
      (err, token) => {
        // put token in cookie
        res.cookie("token", token, {
          sameSite: "none",
          secure: true,
          expire: new Date() + 9999,
        });
        // send response to front end
        const { email } = req.body;
        return res.json({
          token,
          user: { _id: foundUser._id, email, userName: foundUser.userName },
        });
      },
    );
  } else {
    return res.status(400).json({
      err: "email and password do not match",
    });
  }
};

// Profile

exports.profile = async (req, res) => {
  await User.find().then(userDetails => {
    if (!userDetails) {
      return res.status(401).json({
        error: "Not Users Found In DB",
      });
    } else {
      userDetails.map(el => ((el.password = undefined), (el.__v = undefined)));
      res.status(200).json({
        userDetails: userDetails,
      });
    }
  });
};

//  signout === Leave the Accont
exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "successfully sign out",
  });
};
