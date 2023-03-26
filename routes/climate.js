const express = require('express');
const router = express.Router();
const { Data } = require('../models/data');
const { authenticateUser, authoriseUser } = require('../middleware');

router.use(authenticateUser)

// GET all climate data
router.get('/', authoriseUser(['administrator', 'teacher', 'student']), async (req, res) => {
  try {
    const data = await Data.find({});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// POST a new climate data entry
router.post('/', authoriseUser(['administrator', 'teacher']), async (req, res) => {
  try {
    const data = new Data(req.body);
    await data.save();
    res.status(201).send(data);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

// GET climate data by ID
router.get('/:id', authoriseUser(['administrator', 'teacher', 'student']), async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);
    if (!data) {
      return res.status(404).send('Climate data not found');
    }
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// PUT update climate data by ID
router.put('/:id', authoriseUser(['administrator', 'teacher']), async (req, res) => {
  try {
    const data = await Data.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!data) {
      return res.status(404).send('Climate data not found');
    }
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

// DELETE climate data by ID
router.delete('/:id', authoriseUser(['administrator', 'teacher']), async (req, res) => {
  try {
    const data = await Data.findByIdAndDelete(req.params.id);
    if (!data) {
      return res.status(404).send('Climate data not found');
    }
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

module.exports = router;