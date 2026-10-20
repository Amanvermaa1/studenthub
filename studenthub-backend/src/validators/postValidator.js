const { body } = require("express-validator");

const postValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 160 })
    .withMessage("Title must be under 160 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),

  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),
];

module.exports = { postValidation };
