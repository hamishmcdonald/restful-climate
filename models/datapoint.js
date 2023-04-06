const mongoose = require('mongoose')

const dataSchema = new mongoose.Schema({
    time: {
        type: String
    },
    deviceNameLocation: {
        type: String
    },
    temperature: {
        type: Number
    },
    atmosphericPressure: {
        type: Number
    },
    lightningAverageDistance: {
        type: Number
    },
    lightningStrikeCount: {
        type: Number
    },
    maximumWindSpeed: {
        type: Number
    },
    precipitation: {
        type: Number
    },
    solarRadiation: {
        type: Number
    },
    vaporPressure: {
        type: Number
    },
    humidity: {
        type: Number
    },
    windDirection: {
        type: Number
    },
    windSpeed: {
        type: Number
    }
})

module.exports = mongoose.model('Datapoint', datapointSchema)