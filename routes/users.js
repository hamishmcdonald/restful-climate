const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { authenticateUser, authoriseUser } = require('../middleware');

router.use(authenticateUser, authoriseUser(['admin', 'teacher']))

router.get('/', async (req, res) => {
    try {
        const user = await User.find({})
        res.send(user)
    } catch (err) {
        console.log(error);
        es.status(500).send(error.message);
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
          console.log(error);
          res.status(500).send(error.message);
    }
})

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, username, password, role, lastLogin } = req.body

    const user = new User({firstName, lastName, email, username, password, role, lastLogin});

    user.save((err) => {
      if (err) {
        res.status(500).json({ message: 'Error registering user' });
      } else {
        res.status(200).json({ message: 'User registered successfully' });
      }
    });
});

router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
          
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userAttributes = Object.keys(User.obj)

        for (i = 0; i < userAttributes.length; i++) {
            try {
                user.userAttributes[i] = req.body.userAttributes[i]
            } catch {}
        }
        
        // Save updated user
       await user.save();
    //only return the user once saved
       res.json(user);
    } catch {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = User.deleteOne(User.findById(req.params.id))

        if (deletedUser.deletedCount == 0) {
            res.status(404).send({ error: 'User not found' });
          } else {
            res.send({ message: 'User deleted successfully' });
          }
    } catch (error) {
        // handle errors
        console.error(error);
        res.status(500).send({ error: 'Internal server error' });
    }
})

router.delete()

module.exports = router