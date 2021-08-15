const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    roles: [{ type: String, enum: ["admin", "user"] }],
    isVerified: { type: Boolean, default: false },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);
//-------------------------------------------------------------------------------------------------------------

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, 12);
  next();
});
//-------------------------------------------------------------------------------------------------------------
userSchema.methods.confirmPassword = async function (
  candidatePassword,
  savePassword
) {
  return await bcrypt.compare(candidatePassword, savePassword);
};
//-------------------------------------------------------------------------------------------------------------
// generating auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      id: user._id + "",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10 days",
    }
  );
  return token;
};

//-------------------------------------------------------------------------------------------------------------
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await UserModel.findOne({
    email,
  }).select("+password -createdAt -updatedAt");
  if (!user) {
    throw new Error("Invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }
  user.password = undefined;
  return user;
};
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
