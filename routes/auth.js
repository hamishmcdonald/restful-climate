const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcrypt')

// Registration endpoint
router.post('/register', (req, res) => {
    try {
        const { firstName, lastName, email, username, password} = req.body
        const hashedPassword = hashPassword(password);
        const newUser = new User({ firstName, lastName, email, username, password: hashedPassword });
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
         expiresIn: "1d"
        });
        user.accessToken = accessToken;
        newUser.save()
        } catch (error) {
            next(error)
        }
});

// POST /auth/login
router.post('/login', (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = User.findOne({ username });
        if (!user) return next(new Error('Email does not exist'));
        const validPassword = validatePassword(password, user.password);
        if (!validPassword) return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
         expiresIn: "1d"
        });
        User.findByIdAndUpdate(user._id, { accessToken })
        res.status(200).json({
         data: { email: user.email, role: user.role },
         accessToken
        })
    } catch (error) {
        next(error);
    }
});

//GET a single climate datapoint by ID
router.get('/:id', authoriseUser(['administrator', 'teacher', 'student']), async (req, res) => {
  try {
    const datapoint = await Datapoint.findById(req.params.id);
    if (!datapoint) {
      return res.status(404).send('Climate datapoint not found');
    }
    res.send(datpoint);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// GET the entire collection of climate datapoints
router.get('/', authoriseUser(['administrator', 'teacher', 'student']), async (req, res) => {
  try {
    const datapoints = await Datapoint.find({});
    res.send(datapoints);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// POST a new climate datapoint entry
router.post('/', authoriseUser(['administrator', 'teacher']), async (req, res) => {
  try {
    const datapoint = new Datapoint(req.body);
    await datapoint.save();
    res.status(201).send(datapoint);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});



// PUT update climate datapoint by ID
router.put('/:id', authoriseUser(['administrator', 'teacher']), async (req, res) => {
  try {
    const datapoint = await Datapoint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!datpoint) {
      return res.status(404).send('Climate datapoint not found');
    }
    res.send(datapoint);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

// PATCH update climate datapoint by ID
router.patch('/:id', authoriseUser(['administrator', 'teacher']), async (req, res) => {
  try {
    const datapoint = await Datapoint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!datpoint) {
      return res.status(404).send('Climate datapoint not found');
    }
    res.send(datapoint);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

// DELETE climate datapoint by ID
router.delete('/:id', authoriseUser(['administrator', 'teacher']), async (req, res) => {
  try {
    const datapoint = await Datapoint.findByIdAndDelete(req.params.id);
    if (!datapoint) {
      return res.status(404).send('Climate datapoint not found');
    }
    res.send(datapoint);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

module.exports = router;

function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
    
function validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = router