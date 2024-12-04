const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    emailAddress: String,
    userType: {
        type: String,
        enum: ['student', 'teacher', 'sensor'],
        default: 'student',
    },
    lastLogin: Number,              //unix time
});

const weatherDatapointSchema = new Schema({
    deviceName: String,
    precipitation:  Number,         //mm/h
    time: BigInt,                   //unix time
    latitude: Number,               //°S
    longitude: Number,              //°E
    temperature: Number,            //°C
    atmosphericPressure: Number,    //kPa
    maxWindSpeed: Number,           //m/s
    solarRadiation: Number,         //W/m^2
    vaporPressure: Number,          //kPa
    humidity: Number,               //%
    windDirection: Number,          //°
});


userSchema.plugin(passportLocalMongoose);

module.exports = {
    User: mongoose.model('User', userSchema),
    WeatherDatapoint: mongoose.model('WeatherDatapoint', weatherDatapointSchema),
};