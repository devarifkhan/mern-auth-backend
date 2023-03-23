const { check, validationResult } = require("express-validator");

exports.userValidator = [
  check("name").trim().not().isEmpty().withMessage("Name is required"),
  check("email").normalizeEmail().isEmail().withMessage("Email is required"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 8,
      max: 20,
    })
    .withMessage("Password must be between 8 and 20 characters"),
];

exports.validatePassword = [
  check("newPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 8,
      max: 20,
    })
    .withMessage("Password must be between 8 and 20 characters"),
];

exports.signInValidator = [
  check("email").normalizeEmail().isEmail().withMessage("Email is required"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is required")
];

exports.validate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.json({ error: error[0].msg });
  }

  next();
};
