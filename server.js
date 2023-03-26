require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Admin = require('./models/admin')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }, )
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', async () => {
    try {
        const admin = new User({
            username: 'root',
            password: process.env.ADMIN_PASSWORD,
            role: 'admin'
        })
        await admin.save();
    } catch (err) {
        console.error(err);
    }
})

app.use(express.json())

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const climateDataRouter = require('./routes/climate')

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/climate', climateRouter)

app.listen(3000, () => console.log('Server Started'));

