const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const logging = require('./middleware/logging');

const app = express();

// Middleware
app.use(logging);

// Routing
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;