const mongoose = require('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGODB_ADDRESS, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(console.log(`Database listening on ${process.env.MONGODB_ADDRESS}...`)).catch(err => console.log(err))