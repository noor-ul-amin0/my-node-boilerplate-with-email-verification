const router = require("express").Router();
const { check } = require("express-validator");
const { signUp, emailVerification } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("email").notEmpty().withMessage("Email cannot be empty."),
    check("password", "Your password must be at least 5 characters")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .isLength({ min: 5 }),
    check("email", "Your email is not valid").isEmail().normalizeEmail(),
  ],
  signUp
);
router.put("/verify-email/:token", emailVerification);

module.exports = router;
