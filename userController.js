// const User = require('../models/userModel');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const roles = ['student', 'teacher', 'admin']

// authenticateUser 

const authoriseUser = (roles) => {
    return (req, res, next) => {
      const userRole = req.user.role;
      if (!roles.includes(userRole)) {
        return res.status(403).send('Unauthorised');
      }
      next()
    };
  };

const authenticateUser = () => {
    return (req, res, next) => {
        jwt.verify(req.user.accessToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Invalid access token'
                })
            }
        })
        next()
    }
}


// exports.grantAccess = function(action, resource) {
//  return async (req, res, next) => {
//   try {
//    const permission = roles.can(req.user.role)[action](resource);
//    if (!permission.granted) {
//     return res.status(401).json({
//      error: "You don't have enough permission to perform this action"
//     });
//    }
//    next()
//   } catch (error) {
//    next(error)
//   }
//  }
// }

// exports.allowIfLoggedin = async (req, res, next) => {
//  try {
//   const user = res.locals.loggedInUser;
//   if (!user)
//    return res.status(401).json({
//     error: "You need to be logged in to access this route"
//    });
//    req.user = user;
//    next();
//   } catch (error) {
//    next(error);
//   }
// }