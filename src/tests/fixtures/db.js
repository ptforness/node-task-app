const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const Task = require('../../models/task');

const newUserOneId = new mongoose.Types.ObjectId();
const newUserOne =  {
    _id: newUserOneId,
    name: 'Paul',
    email: 'paul@example.com',
    password: '1234567',
    tokens: [{
        token: jwt.sign({ _id: newUserOneId }, process.env.JWT_SECRET)
    }]
}

const newUserTwoId = new mongoose.Types.ObjectId();
const newUserTwo = {
    _id: newUserTwoId,
    name: 'John',
    email: 'john@example.com',
    password: '1234567',
    tokens: [{
        token: jwt.sign({ _id: newUserTwoId }, process.env.JWT_SECRET)
    }]
}

const newTaskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First Task',
    isComplete: false,
    owner: newUserOneId
}

const newTaskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    isComplete: true,
    owner: newUserOneId
}

const newTaskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task',
    isComplete: false,
    owner: newUserTwoId
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(newUserOne).save();
    await new User(newUserTwo).save();
    await new Task(newTaskOne).save();
    await new Task(newTaskTwo).save();
    await new Task(newTaskThree).save();
}

module.exports = {
    newUserOneId,
    newUserOne,
    newUserTwoId,
    newUserTwo,
    newTaskOne,
    newTaskTwo,
    newTaskThree,
    setupDatabase
}