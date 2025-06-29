const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.userId = decoded.userId;
    next();
  });
}

module.exports = io => {
  const router = express.Router();
  router.use(authenticate);

  router.get('/', async (req, res) => {
    const tasks = await Task.find({
      $or: [{ owner: req.userId }, { sharedWith: req.userId }],
    });
    res.json(tasks);
  });

  router.post('/', async (req, res) => {
    const task = await Task.create({ ...req.body, owner: req.userId });
    io.emit('taskCreated', task);
    res.status(201).json(task);
  });

  router.put('/:id', async (req, res) => {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );
    io.emit('taskUpdated', task);
    res.json(task);
  });

  router.delete('/:id', async (req, res) => {
    await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    io.emit('taskDeleted', req.params.id);
    res.sendStatus(204);
  });

  router.post('/share/:id', async (req, res) => {
    const { email } = req.body;
    const userToShare = await User.findOne({ email });
    if (!userToShare) return res.status(404).json({ error: 'User not found' });
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { sharedWith: userToShare._id } },
      { new: true }
    );
    io.emit('taskShared', task);
    res.json(task);
  });

  return router;
};
