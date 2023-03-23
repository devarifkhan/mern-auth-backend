const PasswordResetToken = require("../models/passwordResetToken");
const { isValidObjectId } = require("mongoose");
const { sendError } = require("../utils/helper");
exports.isValidPasswordResetToken = async (req, res, next) => {
  const { token, userId } = req.body;
  if (!token.trim() || !isValidObjectId(userId))
    return sendError(res, "Invalid Token");
  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  if (!resetToken) return sendError(res, "Unauthorized access, Invalid Token!");

  const matched = await resetToken.compareToken(token);
  if(!matched) return sendError(res, "Unauthorized access, Invalid Token!");

  req.resetToken=resetToken
  next();
};
