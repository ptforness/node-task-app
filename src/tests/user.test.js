const app = require('../app');
const request = require('supertest');
const User = require('../models/user');
const { newUserOneId, newUserOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

const userTwo = {
    name: 'Mike',
    email: 'mike@example.com',
    password: '1234567'
}

test('Should sign up a new user.', async () => {

    const response = await request(app)
        .post('/users')
        .send(userTwo)
        .expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Mike',
            email: 'mike@example.com'
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('1234567');
});

test('Should login existing user.', async () => {
    const response = await request(app)
        .post('/login')
        .send({
            email: newUserOne.email,
            password: newUserOne.password
        }).expect(200);

    // Assertions about the response
    const user = await User.findById(response.body.user._id);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistant user.', async () => {
    await request(app)
        .post('/login')
        .send({
            email: 'badEmail@example.com',
            password: 'thisShouldNotWork'
        }).expect(400);
});

test('Should get profile for user.', async () => {
    await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${newUserOne.tokens[0].token}`)
        .expect(200);
});

test('Should not get profile for unauthenticated user.', async () => {
    await request(app)
        .get('/profile')
        .expect(401);
});

test('Should delete account for user.', async () => {
    const response = await request(app)
        .delete('/profile')
        .set('Authorization', `Bearer ${newUserOne.tokens[0].token}`)
        .expect(200);

    const user = await User.findById(newUserOneId);
    expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user.', async () => {
    await request(app)
        .delete('/profile')
        .expect(401);
});

test('Should upload avatar image.', async () => {
    await request(app)
        .post('/profile/avatar')
        .set('Authorization', `Bearer ${newUserOne.tokens[0].token}`)
        .attach('avatar', './src/tests/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(newUserOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/profile')
        .set('Authorization', `Bearer ${newUserOne.tokens[0].token}`)
        .send({
            name: 'John'
        })
        .expect(200);
    
    const user = await User.findById(newUserOneId);
    expect(user.name).toEqual('John');
});

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/profile')
        .set('Authorization', `Bearer ${newUserOne.tokens[0].token}`)
        .send({
            location: 'locationIsNotAValidUpdate'
        })
        .expect(400);
});