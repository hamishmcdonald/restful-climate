const express = require('express');
const router = express.Router();
const { Datapoint } = require('../models/datapoint');
const { authoriseUser } = require('../middleware');

router.use(authenticateUser)

// GET a single climate datapoint by ID
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



// PUT an update to a climate datapoint by ID
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

// PATCH an update to climate datapoint by ID
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

// v
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