const app = require('../app');
const request = require('supertest');
const Task = require('../models/task');
const { 
    newUserOne,
    newUserTwo,
    newTaskOne,
    setupDatabase 
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${newUserOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201);
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.isComplete).toEqual(false);
});

test('Should get all tasks owned by newUserOne', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${newUserOne.tokens[0].token}`)
        .expect(200);
    expect(response.body.length).toEqual(2);
});

test('Should not delete task owned by another user', async () => {
    await request(app)
        .delete(`/tasks/${newTaskOne._id}`)
        .set('Authorization', `Bearer ${newUserTwo.tokens[0].token}`)
        .expect(404);
    const task = await Task.findById(newTaskOne._id);
    expect(task).not.toBeNull();
});