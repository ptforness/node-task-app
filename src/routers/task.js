const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = express.Router();

// CREATE A NEW TASK
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body, // Copies all properties from body to this object
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task); // Success
    } catch (e) {
        res.status(400).send(e); // Bad Request
    }
});

// READ ALL TASKS
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.isComplete = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('_');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks); // Success
    } catch (e) {
        res.status(500).send(e); // Server Error
    }
});

// READ A SINGLE TASK
router.get('/tasks/:id', auth, async (req, res) => {
    // Precondition: ID passed by request must be a valid Object ID:
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send(); // Invalid ID

    // Default Case:
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) return res.status(404).send(); // Not Found
        res.send(task); // Success
    } catch (e) {
        res.status(500).send(e); // Server Error
    }
});

// UPDATE A SINGLE TASK
router.patch('/tasks/:id', auth, async (req, res) => {
    // Precondition: ID passed by request must be a valid Object ID:
    const _id = req.params.id;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send({ error: 'Invalid task ID requested.'});

    // Precondition: User must only update fields they are allowed to:
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'isComplete'];
    const allUpdatesAllowed = updates.every(update => allowedUpdates.includes(update));
    if (!allUpdatesAllowed) return res.status(400).send({ error: 'Invalid updates.'}); // Invalid Updates

    try {
        const task = await Task.findOne({ _id, owner: user._id });
        if (!task) return res.status(404).send('404 - Task not found.'); // Not Found

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task); // Success
    } catch (e) {
        res.status(400).send(e); // Bad Request
    }
});

// DELETE A SINGLE TASK
router.delete('/tasks/:id', auth, async (req, res) => {
    // Precondition: ID passed by request must be a valid Object ID:
    const _id = req.params.id;
    const user = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send({ error: 'Invalid task ID requested.' }); // Invalid ID

    // Default Case:
    try {
        const task = await Task.findOne({ _id, owner: user._id });
        if (!task) return res.status(404).send(); // Not Found
        await task.remove(); 
        res.send(task); // Success
    } catch (e) {
        res.status(500).send(e); // Server Error
    }
});

module.exports = router;