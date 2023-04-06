const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

// Registration endpoint
router.post('/register', (req, res) => {
    const {firstName, lastName, email, username, password, lastLogin } = req.body

    const user = new User({firstName, lastName, email, username, password, lastLogin });

    user.save((err) => {
      if (err) {
        res.status(500).json({ message: 'Error registering user' });
      } else {
        res.status(200).json({ message: 'User registered successfully' });
      }
    });
});

// POST /auth/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
        if (err) {
        return next(err);
      }
      try {
        const token = jwt.sign({username: user.username}, crypto.randomBytes(32).toString('hex'), { expiresIn: '1h' })
        return res.json({ token });
      } catch(err) {
        return
      }
    });
  })(req, res, next);
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    req.logout();
    res.sendStatus(200);
});

module.exports = router