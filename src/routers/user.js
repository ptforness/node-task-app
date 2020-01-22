const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');

const router = new express.Router();

const uploadAvatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Avatar must be a .jpg, .jpeg or .png file.'));
        }
        cb(undefined, true);
    }
});

// SIGNUP
router.post('/users', async (req, res) => {
    const user = new User(req.body);

    // Default Case:
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token }); // Success
    } catch (e) {
        res.status(400).send(e); // Bad Request
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        
        const token = await user.generateAuthToken();
        res.send({ user, token }); // Success
    } catch (e) {
        res.status(400).send({ error: 'Invalid Credentials.'} ); // Server Error
    }
});

// LOGOUT - CURRENT DEVICE
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// LOGOUT - ALL DEVICES
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// PROFILE - READ
router.get('/profile', auth, async (req, res) => {
    // Default Case:
    res.send(req.user);
});

// PROFILE - UPDATE
router.patch('/profile', auth, async (req, res) => {
    // Precondition: User must only update fields they are allowed to:
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const allUpdatesAllowed = updates.every(update => allowedUpdates.includes(update));
    if (!allUpdatesAllowed) return res.status(400).send({ error: 'Invalid updates.'}); // Invalid Updates

    // Default Case:
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user); // Success
    } catch (e) {
        res.status(400).send(e); // Bad Request
    }
});

// PROFILE - DELETE
router.delete('/profile', auth, async (req, res) => {
    // Default Case:
    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user); // Success
    } catch (e) {
        res.status(500).send(e); // Server error
    }
});

router.post('/profile/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
    //req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    try {
        res.send();
    } catch (e) {
        res.status(500).send({ error: 'Could not upload avatar.'});
    }
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
});

router.delete('/profile/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) throw new Error();
        
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

module.exports = router;