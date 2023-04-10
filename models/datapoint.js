const mongoose = require('mongoose')

const datapointSchema = new mongoose.Schema({
    metadata_time: String,
    device_name: String,
    location: { lon: Number, lat: Number },
    payload_fields_air_temperature_value: Number,
    payload_fields_atmospheric_pressure_value: Number,
    payload_fields_lightning_average_distance_value: Number,
    payload_fields_lightning_strike_count_value: Number,
    payload_fields_maximum_wind_speed_value: Number,
    payload_fields_precipitation_value: Number,
    payload_fields_solar_radiation_value: Number,
    payload_fields_vapor_pressure_value: Number,
    payload_fields_relative_humidity_value: Number,
    payload_fields_wind_direction_value: Number,
    payload_fields_wind_speed_value: Number
})

datapointSchema.index({});

module.exports = mongoose.model('Datapoint', datapointSchema)