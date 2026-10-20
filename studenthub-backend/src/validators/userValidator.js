const { body, validationResult } = require("express-validator");

// Register Validation
const registerValidation = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

];
const loginValidation = [

  body("email")
    .isEmail()
    .withMessage("Enter a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

];

// Validation Result Middleware
const validate = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(400).json({
      message: errors
        .array()
        .map((error) => error.msg)
        .join(" "),
      errors: errors.array(),
    });

  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  validate,
};