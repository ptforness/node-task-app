const express = require('express');
require('./db/mongoose');
require('dotenv').config();
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const logging = require('./middleware/logging');

const app = express();
const port = process.env.EXPRESS_PORT || process.env.PORT || 3000;

// Middleware
app.use(logging);

// Routing
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
    console.log(`Express server listening on port ${port}...`);
});