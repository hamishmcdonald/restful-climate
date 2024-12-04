/** todo:
 * - send errors and user/weatherdatapoint objects in response
 * - correct error handling for remove/modify rest users in range
 * 
 * 
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo');
const router = express.Router();
const cors = require('cors');
const http = require('http');
const connect = require('./db');
const { User, WeatherDatapoint } = require('./models');

//WARNING!!! CONSTANT 'IN_DEVELOPMENT' MUST BE CHANGED TO 'false' BEFORE CODE IS DEPLOYED TO PRODUCTION ENVIROMENT!!!
//binary constant for if the code is in a production or development enviroment
//allows access to '/api-auth/admin' endpoint for adding admin users, simplifying the debugging process
IN_DEVELOPMENT = true

const app = express();

//WARNING!!! PROTOCOL MUST BE CHANGED TO HTTPS BEFORE CODE IS DEPLOYED TO PRODUCTION ENVIROMENT !!!
//setup api to use http
const server = http.createServer(app);

//enable all cross origin resource requests to prevent errors in development enviroment
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));

//connect to mongodb database
connect().then((connection) => {
  console.log('MongoDB connected successfully');

  server.listen(process.env.SERVER_PORT, (error) => {
    if (error) {
        console.error('Error starting server:', error);
    } else {
        console.log(`Server is running on port ${process.env.SERVER_PORT}`);
    }
  });
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);  

  process.exit(1);
});

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGODB_URI})
}));

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());

//server accepts parameters in JSON format
app.use(express.json());

//permission functions for api endpoints based on userType of currently logged in user
function isTeacher(request) {
    return request.user.userType === 'teacher';
};

function isTeacherOrSensor(request) {
    return request.user.userType === 'teacher' || request.user.userType === 'sensor';
};

function isTeacherOrStudent(request) {
    return request.user.userType === 'teacher' || request.user.userType === 'student';
};

//add teacher user
//only accessible when IN_DEVELOPMENT = true
app.post('/api/admin', function (request, response) {
    if (IN_DEVELOPMENT) {
        User.register(new User({ firstName: request.body.firstName,
            lastName: request.body.lastName,
            emailAddress: request.body.emailAddress,
            username: request.body.username,
            userType: 'teacher',
            lastLogin: Date.now() }), request.body.password, (error, user) => {
            if (error) {
              response.sendStatus(500);
              response.end();
            }
            passport.authenticate('local')(request, response, () => {
              response.sendStatus(201);
              response.end();
            });
        });
    } else {
        response.sendStatus(403);
        response.end();
    };
});

//user login
app.post('/api/login', passport.authenticate('local'), (request, response) => {
    response.sendStatus(200);
});

//add rest user
app.post('/api/rest/user', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {
            User.register(new User({ firstName: request.body.firstName,
                lastName: request.body.lastName,
                emailAddress: request.body.emailAddress,
                username: request.body.username,
                userType: request.body.userType,
                lastLogin: Date.now() }), request.body.password, (error, user) => {
                if (error) {
                  response.sendStatus(500);
                  //send error in response
                }
                passport.authenticate('local')(request, response, () => {
                  response.sendStatus(201);
                });
            });
        } else {
            response.sendStatus(403);
        };
    } else {
        response.sendStatus(401);
    };
});

//remove rest user by username
app.delete('/api/rest/user/:username', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {
            User.findOneAndDelete({ username: request.params.username })
            .then(deletedUser => {
                response.sendStatus(200);
            })
            .catch(error => {
                response.sendStatus(500);
            })
        } else {
            response.sendStatus(403);
        };
    } else {
        response.sendStatus(401);
    };
});

//modify rest user by username
app.put('/api/rest/user/:username', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {
            const { firstName, lastName, emailAddress, userType, lastLogin } = request.body;

            properties = { firstName, lastName, emailAddress, userType, lastLogin}

            modifiedProperties= {};

            for (property in properties) {
                if (request.body.property !== undefined) {
                    modifiedProperties.append({property: property});
                };
            };

            User.findOneAndUpdate({ username: request.params.username }, { modifiedProperties})
            .then(modifiedUser => {
                response.sendStatus(200);
            })
            .catch(error => {
                response.sendStatus(500);
            })
        } else {
            response.sendStatus(403);
        };
    } else {
        response.sendStatus(401);
    };
});

//read rest user by username
app.get('/api/rest/user/:username', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {
            User.findOne({ username: request.params.username })
            .then(user => {
                if (!user) {
                    console.log(request.params.username, user);
                    response.sendStatus(404);
                } else {
                    console.log(user);
                    response.send(user);
                }
            })
            .catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };
    } else {
        response.sendStatus(401);
    };
});

//remove rest users in range
app.delete('/api/rest/users-in-range', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {
            User.find({ userType: 'student', lastLogin: { $gte: request.body.lastLoginFrom, $lte: request.body.lastLoginTo} })
            .then (users => {
                for (user in users) {
                    User.findOneAndDelete({ username: user.username })
                };
                response.sendStatus(200);
            })
            .catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };
    } else {
        response.sendStatus(401);
    };
});

//modify rest users in range
app.put('/api/rest/users-in-range', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {
            User.find({ lastLogin: { $gte: request.body.lastLoginFrom, $lte: request.body.lastLoginTo} })
            .then (users => {
                response.send(users);
                for (user in users) {
                    User.findOneAndUpdate({ username: user.username }, { userType: request.body.userType })
                    .then(modifiedUser => {
                        response.sendStatus(200);
                    })
                    .catch(error => {
                        response.sendStatus(500);
                    });
                };
            })
            .catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };
    } else {
        response.sendStatus(401);
    };
});

//add weather datapoint
app.post('/api/weather/datapoint', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacherOrSensor(request)) {
            const weatherDatapoint = new WeatherDatapoint({  deviceName: request.body.deviceName,
                precipitation: request.body.precipitation,             //mm/h
                time: request.body.time,                                //unix time
                latitude: request.body.latitude,
                longitude: request.body.longitude,
                temperature: request.body.temperature,                  //°C
                atmosphericPressure: request.body.atmosphericPressure,  //kPa
                maxWindSpeed: request.body.maxWindSpeed,                //m/s
                solarRadiation: request.body.solarRadiation,            //W/m^2
                vaporPressure: request.body.vaporPressure,              //kPa
                humidity: request.body.humidity,                        //%
                windDirection: request.body.windDirection,              //°
                
            })

            weatherDatapoint.save()
            .then(savedWeatherDatapoint=> {
                response.sendStatus(201);
            })
            .catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});

//remove weather datapoint by device name and time
app.delete('/api/weather/datapoint/:deviceName/:time', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {
            WeatherDatapoint.findOneAndDelete({ deviceName: request.params.deviceName, time: request.params.time})
            .then(deletedWeatherDatapoint => { 
                response.sendStatus(200);
            })
            .catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});

//modify weather datapoint by device name and time
app.put('/api/weather/datapoint/:deviceName/:time', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacher(request)) {

            const { deviceName, precipitation, time, latitude, longitude, temperature, atmosphericPressure, maxWindSpeed, 
                solarRadiation, vaporPressure, humidity, windDirection} = request.body;

            properties = { deviceName, precipitation, time, latitude, longitude, temperature, atmosphericPressure, 
                maxWindSpeed, solarRadiation, vaporPressure, humidity, windDirection }

            modifiedProperties= {}
        
            for (property in properties) {
                if (request.body.property !== undefined) {
                    modifiedProperties.append({property: property})
                }
            }
    
            WeatherDatapoint.findOneAndUpdate({ deviceName: request.params.deviceName, time: request.params.time }, 
            { modifiedProperties })
            .then(modifiedWeatherDatapoint => {
                response.sendStatus(200);
            })
            .catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});

//read weather datapoint by device name and time
app.get('/api/weather/datapoint/:deviceName/:time', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacherOrStudent(request)) {
            WeatherDatapoint.findOne({ deviceName: request.params.deviceName, time: request.params.time })
            .then(weatherDatapoint => {
                if (!weatherDatapoint) {
                    response.sendStatus(404);
                } else {
                    response.send(weatherDatapoint);
                }
            })
            .catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});

//add weather dataset
app.post('/api/weather/dataset', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacherOrSensor(request)) {
            try {
                for (weatherDatapoint in request.body) {
                    const weatherDatapoint = new WeatherDatapoint({  deviceName: request.body.deviceName,
                        precipitation: request.body.precipitation,             //mm/h
                        time: request.body.time,                                //unix time
                        latitude: request.body.latitude,
                        longitude: request.body.longitude,
                        temperature: request.body.temperature,                  //°C
                        atmosphericPressure: request.body.atmosphericPressure,  //kPa
                        maxWindSpeed: request.body.maxWindSpeed,                //m/s
                        solarRadiation: request.body.solarRadiation,            //W/m^2
                        vaporPressure: request.body.vaporPressure,              //kPa
                        humidity: request.body.humidity,                        //%
                        windDirection: request.body.windDirection,              //°
                        
                    })
        
                    weatherDatapoint.save()
                    
                }
                response.sendStatus(201);

            } catch {(error => {
                response.sendStatus(500);
            })};
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});

//find the maximum precipitation between two points in time (unix) for a specified deviceName (optional)
app.get('/api/weather/data-in-range/max-precipitation', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacherOrStudent(request)) {
            if (request.body.deviceName !== undefined) {
                WeatherDatapoint.find({ deviceName: request.body.deviceName, time: { $gte: request.body.timeFrom, 
                    $lte: request.body.timeTo } }).sort({ precipitation: -1 }).limit(1)
                    .then( weatherDatapoint => {
                        response.send({
                            deviceName: weatherDatapoint[0].deviceName,
                            precipitation: weatherDatapoint[0].precipitation,
                            time: Number(weatherDatapoint[0].time),
                            latitude: weatherDatapoint[0].latitude,
                            longitude: weatherDatapoint[0].longitude,
                            temperature: weatherDatapoint[0].temperature,
                            atmosphericPressure: weatherDatapoint[0].atmosphericPressure,
                            maxWindSpeed: weatherDatapoint[0].maxWindSpeed,
                            solarRadiation: weatherDatapoint[0].solarRadiation,
                            vaporPressure: weatherDatapoint[0].vaporPressure,
                            humidity: weatherDatapoint[0].humidity,
                            windDirection: weatherDatapoint[0].windDirection 
                        });
                    }).catch(error => {
                        response.sendStatus(500);
                    });
            } else {
                WeatherDatapoint.find({ time: { $gte: request.body.timeFrom, $lte: request.body.timeTo} })
                    .sort({ precipitation: -1 }).limit(1)
                    .then( weatherDatapoint => {
                        response.send({
                            deviceName: weatherDatapoint[0].deviceName,
                            precipitation: weatherDatapoint[0].precipitation,
                            time: Number(weatherDatapoint[0].time),
                            latitude: weatherDatapoint[0].latitude,
                            longitude: weatherDatapoint[0].longitude,
                            temperature: weatherDatapoint[0].temperature,
                            atmosphericPressure: weatherDatapoint[0].atmosphericPressure,
                            maxWindSpeed: weatherDatapoint[0].maxWindSpeed,
                            solarRadiation: weatherDatapoint[0].solarRadiation,
                            vaporPressure: weatherDatapoint[0].vaporPressure,
                            humidity: weatherDatapoint[0].humidity,
                            windDirection: weatherDatapoint[0].windDirection 
                        });
                    }).catch(error => {
                        response.sendStatus(500);
                    });
            }
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});

//find the maximum temperature between two points in time (unix)
app.get('/api/weather/data-in-range/max-temperature', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacherOrStudent(request)) {
            WeatherDatapoint.find({ time: { $gte: request.body.timeFrom, $lte: request.body.timeTo} })
            .sort({ temperature: -1 }).limit(1)
            .then( weatherDatapoint => {
                response.send({
                    deviceName: weatherDatapoint[0].deviceName,
                    precipitation: weatherDatapoint[0].precipitation,
                    time: Number(weatherDatapoint[0].time),
                    latitude: weatherDatapoint[0].latitude,
                    longitude: weatherDatapoint[0].longitude,
                    temperature: weatherDatapoint[0].temperature,
                    atmosphericPressure: weatherDatapoint[0].atmosphericPressure,
                    maxWindSpeed: weatherDatapoint[0].maxWindSpeed,
                    solarRadiation: weatherDatapoint[0].solarRadiation,
                    vaporPressure: weatherDatapoint[0].vaporPressure,
                    humidity: weatherDatapoint[0].humidity,
                    windDirection: weatherDatapoint[0].windDirection 
                });
            }).catch(error => {
                response.sendStatus(500);
            });
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});

//find the maximum precipitation weather datapoint filtered by maximum and minimum values for humidity and precipitation
app.get('/api/weather/data-in-range/humidity-precipitation', async (request, response) => {
    if (request.isAuthenticated()) {
        if (isTeacherOrStudent(request)) {
            WeatherDatapoint.find({ humidity: { $gte: request.body.humidityFrom, $lte: request.body.humidityTo},
                precipitation: { $gte: request.body.precipitationFrom, $lte: request.body.precipitationTo} })
                .sort({ precipitation: -1 }).limit(1)
                .then( weatherDatapoint => {
                    response.send({
                        deviceName: weatherDatapoint[0].deviceName,
                        precipitation: weatherDatapoint[0].precipitation,
                        time: Number(weatherDatapoint[0].time),
                        latitude: weatherDatapoint[0].latitude,
                        longitude: weatherDatapoint[0].longitude,
                        temperature: weatherDatapoint[0].temperature,
                        atmosphericPressure: weatherDatapoint[0].atmosphericPressure,
                        maxWindSpeed: weatherDatapoint[0].maxWindSpeed,
                        solarRadiation: weatherDatapoint[0].solarRadiation,
                        vaporPressure: weatherDatapoint[0].vaporPressure,
                        humidity: weatherDatapoint[0].humidity,
                        windDirection: weatherDatapoint[0].windDirection 
                    });
                }).catch(error => {
                    response.sendStatus(500);
                });
        } else {
            response.sendStatus(403);
        };  
    } else {
        response.sendStatus(401);
    };
});