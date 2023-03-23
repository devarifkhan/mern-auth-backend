const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utils/mail");
const { sendError, generateRandomByte } = require("../utils/helper");
const passwordResetToken = require("../models/passwordResetToken");
const PasswordResetToken = require("../models/passwordResetToken");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) return sendError(res, "User already exists!");
  const newUser = new User({ name, email, password });
  await newUser.save();

  //generate 6 digit otp
  let OTP = generateOTP();
  //store that otp inside our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //send that otp to user's email

  // var transport = nodemailer.createTransport({
  //   host: "sandbox.smtp.mailtrap.io",
  //   port: 2525,
  //   auth: {
  //     user: "217ec9170031ca",
  //     pass: "c55f68b6f99edb",
  //   },
  // });

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arifcse209@gmail.com",
      pass: "wkjncdwgusdowznz",
    },
  });

  transport.sendMail({
    from: "aricse209@gmail.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
    <p>Your verification OTP</p>
    <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) return sendError(res, "Invalid user!");

  const user = await User.findById(userId);
  if (!user) return sendError(res, "user not exists!", 404);

  if (user.isVerified) return sendError(res, "User already verified!");

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, "Token not found!");

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, "Invalid OTP!");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arifcse209@gmail.com",
      pass: "wkjncdwgusdowznz",
    },
  });

  transport.sendMail({
    from: "arifcse209@gmail.com",
    to: user.email,
    subject: "Welcome to Review",
    html: `
    <h1>Welcome to Review</h1>
    <p>Thank you for verifying your email</p>
    `,
  });
  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, token: jwtToken },
    message: "Email verified successfully!",
  });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, "User not exists!");

  if (user.isVerified) return sendError(res, "This email is already verified!");

  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (alreadyHasToken)
    return sendError(
      res,
      "Only after one hour you can request for another token!"
    );

  //generate 6 digit otp
  let OTP = generateOTP();
  //store that otp inside our db
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //send that otp to user's email

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arifcse209@gmail.com",
      pass: "wkjncdwgusdowznz",
    },
  });

  transport.sendMail({
    from: "arifcse209@gmail.com",
    to: user.email,
    subject: "Email Verification",
    html: `
   <p>Your verification OTP</p>
   <h1>${OTP}</h1>
   `,
  });

  res.json({ message: "OTP has been sent to your email account!" });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Email is required!");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found!", 404);

  const alreadyHasToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyHasToken)
    return sendError(
      res,
      "Only after one hour you can request for another token!"
    );

  const token = await generateRandomByte();
  const newPasswordResetToken = new PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arifcse209@gmail.com",
      pass: "wkjncdwgusdowznz",
    },
  });

  transport.sendMail({
    from: "arifcse209@gmail.com",
    to: user.email,
    subject: "Reset Password Request",
    html: `
    <p>Click the link below to reset your password</p>
    <a href="${resetPasswordUrl}">Change Password</a>
   `,
  });

  res.json({ message: "Reset password link has been sent to your email!" });
};

exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ message: "Valid Token!" });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched) return sendError(res, "New password can't be same as old one!");

  user.password = newPassword;
  await user.save();

  await passwordResetToken.findByIdAndDelete(req.resetToken._id);

  var transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arifcse209@gmail.com",
      pass: "wkjncdwgusdowznz",
    },
  });

  transport.sendMail({
    from: "arifcse209@gmail.com",
    to: user.email,
    subject: "Password Reset Successfully",
    html: `
    <h1>Your password has been reset successfully</h1>
    <p>If you didn't reset your password please contact us immediately</p>
   `,
  });
  res.json({ message: "Password reset successfully!" });
};

exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "Email/password is incorrect!");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Email/password is incorrect!");

  const { _id, name } = user;

  const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);
  res.json({ user: { id: _id, name, email, token: jwtToken } });
};
