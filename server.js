require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/user')
const cors = require('cors')
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }, )
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', async () => {
    try {
        const admin = new User({
            //username: 'root',
            //password: process.env.ADMIN_PASSWORD.toString,
            role: 'admin'
        })
        await admin.save();
    } catch (err) {
        console.error(err);
    }
})

app.use(express.json())
app.use(cors())
const indexRouter = require('./routes/index')
const roleRouter = require('./routes/role')
//const authRouter = require('./routes/auth')
const climateRouter = require('./routes/climate')

app.use('/', indexRouter)
app.use('/role', roleRouter)
//app.use('/auth', authRouter)
app.use('/climate', climateRouter)

// app.use(async (req, res, next) => {
//     if (req.headers["x-access-token"]) {
//      const accessToken = req.headers["x-access-token"];
//      const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
//      // Check if token has expired
//      if (exp < Date.now().valueOf() / 1000) { 
//       return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
//      } 
//      res.locals.loggedInUser = await User.findById(userId); next(); 
//     } else { 
//      next(); 
//     } 
// });

app.listen(PORT, () => {
    console.log('Server is listening on Port:', PORT)
})

