const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
 }

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.register = async (req, res, next) => {
  try {
   const { email, password, role } = req.body
   const hashedPassword = await hashPassword(password);
   const newUser = new User({ email, password: hashedPassword, role: role || "basic" });
   const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
   });
   newUser.accessToken = accessToken;
   await newUser.save();
   res.json({
    data: newUser,
    accessToken
   })
  } catch (error) {
   next(error)
  }
}

function authenticateUser(req, res, next) {
    if (!req.session.user) {
      res.redirect('/auth');
    } else {
      next();
    }
  }

const authoriseUser = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).send('Unauthorised');
    }
    next();
  };
};

module.exports = { authenticateUser, authoriseUser }