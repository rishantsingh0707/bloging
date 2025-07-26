const jwt = require("jsonwebtoken");
const User = require("../models/user"); // adjust path

const setUser = async (req, res, next) => {
  const token = req.cookies?.Token;
  if (token) {
    try {
      const decoded = jwt.verify(token, "Vengeance");  // replace with your JWT secret
      const user = await User.findById(decoded._id);
      res.locals.user = user;
        
    } catch (err) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};

module.exports = setUser
