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