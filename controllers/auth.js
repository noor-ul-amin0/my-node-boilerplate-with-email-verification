const crypto = require("crypto");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");
const catchAsyncAwait = require("../utils/catchAsyncAwait");
const User = require("../models/user");
const Token = require("../models/token");
const sendVerificationEmail = require("../_helpers/sendVerificationEmail");

/**
 * POST /auth/signup
 */
exports.signUp = catchAsyncAwait(async (req, res, next) => {
  const { email, password } = req.body;
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send(errors.array());
  }

  // find user by email
  const userExists = await User.findOne({ email });
  // check if user with this email already exists in db?
  if (userExists)
    return next(
      new AppError(
        "The email address you have entered is already associated with another account.",
        400
      )
    );

  // create a new user in db.
  // here we are using mongoose's Transaction API to commit or abort
  const session = await mongoose.startSession();
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };
  let verificationToken;
  try {
    const transactionResults = await session.withTransaction(async () => {
      const user = new User({ email, password });
      user.roles.push("user");
      const savedUser = await user.save({ session });
      const token = new Token({
        _userId: savedUser._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      verificationToken = await token.save({ session });
    }, transactionOptions);
    if (transactionResults) {
      await sendVerificationEmail({
        email,
        verificationToken: verificationToken.token,
        origin: req.get("origin"),
      });
      return res.send({
        success: true,
        msg: "Verification email sent, please check your email address.",
      });
    } else {
      return next("The transaction was intentionally aborted.", 404);
    }
  } catch (e) {
    const error = new AppError(e.message, 500);
    return next(error);
  } finally {
    session.endSession();
  }
});
/**
 * PUT /aut/verify-email
 */
exports.emailVerification = catchAsyncAwait(async (req, res, next) => {
  // Find a matching token
  const token = await Token.findOne({ token: req.params.token });
  if (!token)
    return next(
      new AppError(
        "We were unable to find a valid token. Your token my have expired.",
        400
      )
    );
  // If we found a token, find a matching user
  const user = await User.findOne({
    _id: token._userId,
    // email: req.body.email,
  });
  // user doesn't exist for some reason .
  if (!user) {
    return next(
      new AppError("We were unable to find a user for this token.", 400)
    );
  }
  // if user exist and is already verified.
  if (user.isVerified) {
    return next(new AppError("This user has already been verified.", 400));
  }
  // negate isVerified prop and save update user and delete token from db.
  user.isVerified = true;
  await user.save();
  await token.remove();
  res.send({
    success: true,
    msg: "The account has been verified. Please log in.",
  });
});
