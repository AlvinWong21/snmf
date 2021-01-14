require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const withQuery = require('with-query').default
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const mysql = require('mysql2/promise')
const { MongoClient, ObjectId } = require('mongodb')

//they said so API
const QUOTES = 'https://quotes.rest/qod'
let QOD = "If you are working on something that you really care about, you don't have to be pushed."

//google calendar
const GOOGLE_CREATE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar'

//SQL Database
const pool = mysql.createPool({
    host: process.env.SQL_DB_HOST,
    port: process.env.SQL_DB_PORT,
    user: process.env.SQL_DB_USER,
    password: process.env.SQL_DB_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionLimit: process.env.SQL_DB_CONN_LIMIT,
    timezone: process.env.SQL_DB_TIMEZONE
})

//sql query statements
const SQL_LOGIN_AUTH = `select * from users where username = ? && password = sha1(?);`
const SQL_CREATE_USER_CHECK_USERNAME = `select count(*) as count from users where username = ?;`
const SQL_CREATE_USER_CHECK_EMAIL = `select count(*) as count from users where email_address = ?;`
const SQL_CREATE_USER = `insert into users (username, password, first_name, last_name, email_address, is_google, calendar_id) values (?, sha1(?), ?, ?, ?, ?, ?);`
const SQL_QUERY_HABITS = `select * from habits where username = ?;`
const SQL_CREATE_HABIT_CHECK = `select count(*) as count from habits where habit_title = ?;`
const SQL_CREATE_HABIT = `insert into habits (username, habit_title, parameter, unit, start_date, end_date, calendar_id) values (?, ?, ?, ?, ?, ?, ?);`
const SQL_QUERY_TEMPLATE = `select habit_id, habit_title, parameter, unit, start_date, end_date from habits where habit_id = ?;`
const SQL_CREATE_RECORD = `insert into records (habit_id, username, ObjectId) values (?, ?, ?);`

//sql query function
const mkQuery = (sql, pool) => {
    return async (args) => {
        const conn = await pool.getConnection()
        try {
            console.log(`Passing parameters>: ${args}`)
            const [result, _] = await conn.query(sql, args)
            console.log("mkQuery: ", result)
            return result
        } catch(e) {
            console.error('Error querying to SQL database: ', e)
            return e
        } finally {
            conn.release()
        }
    }
}

//MongoDB
const mongo = new MongoClient(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})

//local authentication function
const mkAuth = (passport) => {
    return (req, res, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                if ((null != err) || (!user)) {
                    res.status(401)
                    res.type('application/json')
                    res.json({error: err})
                }
                req.userLogin = user
                next()
            }
        )(req, res, next)
    }
}

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

//jwt token secret
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'secret'

//local authentication
passport.use(new LocalStrategy(
    {session: false},
    async (username, password, done) => {
        console.log(`LocalStrategy>>> username ${username}, password: ${password}`)
        const conn = await pool.getConnection()
        try{
            const [ result, _ ] = await conn.query(SQL_LOGIN_AUTH, [username, password])
            console.log('SQL Login Authentication result: ', result)
            if (result.length == 1)
                done(null, {
                    username: result[0].username,
                    loginTime: (new Date()).toString(),
                    isGoogle: false,
                    googleToken: null,
                    calendarId: null,
                })
            else {
                done('Incorrect login', false)
            }
        } catch(e) {
            done(e, false)
        } finally {
            conn.release()
        }
    }
))

//google authentication
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/redirect" 
    }, async (accessToken, refreshToken, profile, done) => {
        const googleAccessToken = accessToken
        let calendarId
        console.log('Calling google...')
        console.log('Google profile ID: ', profile.id)
        console.log("Access Token: ", accessToken)
        const conn = await pool.getConnection()
        try {
            const [ result, _ ] = await conn.query(SQL_LOGIN_AUTH, [profile.id, profile.id])
            console.log('Google Login Authentication result: ', result)
            if (result.length == 1) {
                done(null, {
                    username: result[0].username,
                    loginTime: (new Date()).toString(),
                    isGoogle: true,
                    calendarId: result[0].calendar_id,
                    googleToken: googleAccessToken
                })
            }
            else {
                console.log("Access Token passed to else statement: ", googleAccessToken)
                //create new google calendar for Habitizer
                await fetch('https://www.googleapis.com/calendar/v3/calendars',
                    {
                        method:'post',
                        body: JSON.stringify({ "summary": "Habitizer" }),
                        headers: {
                            'Authorization': `Bearer ${googleAccessToken}`,
                            'Accept': 'appliction/json',
                            'Content-Type': 'application/json'
                        }
                    }
                )
                .then(result => result.json())
                .then(result => {
                    console.log(result)
                    calendarId = result.id
                })
                .catch(json => {
                    console.log("Google Calendar", json)
                    console.log("errors: ", json.error.errors)
                })
                await sqlCreateUser([
                    profile.id,
                    profile.id,
                    profile.name.givenName,
                    profile.name.familyName,
                    profile.emails[0].value,
                    true,
                    calendarId
                ])
                done(null, {
                    username: profile.id,
                    loginTime: (new Date()).toString(),
                    isGoogle: true,
                    calendarId,
                    googleToken: googleAccessToken
                })
            }
        }catch(e) {
            done(e, false)
        } finally {
            conn.release()
        }
    }
))

passport.serializeUser((user, done) => {
    console.log(user)
    done(null, user);
  });

//constant functions
const sqlCreateUserCheckUsername = mkQuery(SQL_CREATE_USER_CHECK_USERNAME, pool)
const sqlCreateUserCheckEmail = mkQuery(SQL_CREATE_USER_CHECK_EMAIL, pool)
const sqlCreateUser = mkQuery(SQL_CREATE_USER, pool)
const sqlCreateHabitCheck = mkQuery(SQL_CREATE_HABIT_CHECK, pool)
const sqlCreateHabit = mkQuery(SQL_CREATE_HABIT, pool)
const sqlQueryHabits = mkQuery(SQL_QUERY_HABITS, pool)
const sqlQueryTemplate = mkQuery(SQL_QUERY_TEMPLATE, pool)

const localStrategyAuth = mkAuth(passport)

const jwtSecurity = (req, res, next) => {
    const token = req.get('Authorization')
    if (null == token) {
        res.status(403)
        res.type('application/json')
        res.json({message: 'Authorization failed'})
        return
    }
    try {
        const verified = jwt.verify(token, TOKEN_SECRET)
        console.log('Verified token: ', verified)
        req.token = verified
        next()
    } catch(err) {
        res.status(403)
        res.type('application/json')
        res.json({message: 'Incorrect token', error: err})
        return
    }
}

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const app = express()

app.use(morgan('combined'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(passport.initialize())
app.use(passport.session())

app.post('/createuser', async (req, res) => {
    const newUserCred = req.body
    try { 
        //check if username or email exists
        const usernameCheckResult = await sqlCreateUserCheckUsername(newUserCred.username)
        const userExists = usernameCheckResult[0].count
        const emailCheckResult = await sqlCreateUserCheckEmail(newUserCred.email)
        const emailExists = emailCheckResult[0].count
        //returns error if username or email exists
        if ((userExists != 0) || (emailExists != 0)) {
            res.status(409)
            res.type('application/json')
            res.json({message: 'New account creation failed, username or email already exist'})
            return
        }
    const createUserResult = await sqlCreateUser([
            newUserCred.username,
            newUserCred.password,
            newUserCred.firstname,
            newUserCred.lastname,
            newUserCred.email,
            false,
            null
        ])
        if(createUserResult.errno) {
            res.status(401)
            res.type('application/json')
            res.json({message: 'New account creation unsuccessful; database error. \nPlease contact support.'})
            return
        }
        res.status(201)
        res.type('application/json')
        res.json({message: "Account creation successful. Please log in."})
    }catch(err) {
        res.status(401)
        res.type('application/json')
        res.json({message: 'New account creation unsuccessful'})
    }
})

const jwtToken = (userLogin) => {
    const timestamp = (new Date()).getTime() / 1000
    return token = jwt.sign({
        sub: userLogin.username,
        iss: 'habitizer',
        iat: timestamp,
        exp: timestamp + (1000),
        data: {
            loginTime: userLogin.loginTime,
            isGoogle: userLogin.isGoogle,
            googleToken: userLogin.googleToken,
            calendarId: userLogin.calendarId
        }
    }, TOKEN_SECRET)
}

app.post('/auth/local', localStrategyAuth, (req, res) => {
    const userLogin = req.userLogin
    const token = jwtToken(userLogin)
    res.status(200)
    res.type('application/json')
    res.json({successful: userLogin, token: token})
})

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email', GOOGLE_CREATE_CALENDAR_SCOPE],
    session: false
}))

app.get('/auth/google/redirect', passport.authenticate('google', {failureRedirect: '/error'}), (req, res) => {
    const userLogin = req.user
    const token = jwtToken(userLogin)
    let responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
    responseHTML = responseHTML.replace('%value%', JSON.stringify({ 
        successful: userLogin, 
        token: token
    }));

    res.status(200).send(responseHTML);
    }
)

app.get('/queryhabits', jwtSecurity, async (req, res) => {
    if (QOD == '') { 
        const quotesUrl = withQuery(QUOTES, {
            category: "inspire",
            language: "en"
        })
        let result = await fetch(quotesUrl)
        result = await result.json()
        QOD = result['contents']['quotes'][0]['quote']
    }
    console.log(QOD)
    const user = req.token.sub
    const queryHabits = await sqlQueryHabits(user)
    res.status(200)
    res.type('application/json')
    res.json([queryHabits, QOD])
})

app.post('/createhabit', jwtSecurity, async (req, res) => {
    const user = req.token.sub
    const newHabit = req.body
    console.log('createhabit: ', newHabit)

    try {
        console.log(newHabit.title)
        const habitCheckResult = await sqlCreateHabitCheck([newHabit.title])
        const habitExists = habitCheckResult[0].count
        console.log(habitExists)
        if (habitExists != 0) {
            res.status(409)
            res.type('application/json')
            res.json({message: "Error, habit already exist"})
            return
        }
        const createHabitResult = await sqlCreateHabit([
            user,
            newHabit.title,
            newHabit.parameter,
            newHabit.unit,
            newHabit.startdate,
            newHabit.enddate,
            newHabit.calendarId || null
        ])

        if(createHabitResult.errno) {
            res.status(401)
            res.type('application/json')
            res.json({message: 'New habit creation unsuccessful'})
            return
        }
        //create event in google calendar if user account is google
        console.log(req.token.data.isGoogle)
        if (req.token.data.isGoogle) {
            const createEventResult = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${req.token.data.calendarId}/events`, 
            {
                method:'post',
                body: JSON.stringify({
                    "summary": newHabit.title,
                    "start": {
                        // "date": newHabit.calendarStartDate
                        "dateTime": `${newHabit.calendarStartDate}T09:00:00+08:00`,
                        "timeZone": "Singapore"
                    },
                    "end": {
                        // "date": newHabit.calendarStartDate
                        "dateTime": `${newHabit.calendarStartDate}T09:30:00+08:00`,
                        "timeZone": "Singapore"
                    },
                    "recurrence": [
                        `RRULE:FREQ=DAILY;UNTIL=${newHabit.calendarEndDate}`
                    ],
                    "reminders": {
                        "useDefault": false,
                        "overrides": [
                            {
                                "method": "popup",
                                "minutes": 0
                            },
                            {
                                "method": "email",
                                "minutes": 0
                            }
                        ]
                    }
                }),
                headers: {
                    'Authorization': `Bearer ${req.token.data.googleToken}`,
                    'Accept': 'appliction/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(result => result.json())
            .then(result => {console.log(result)})
            .catch(err => {
                console.log(err)
                res.status(401)
                res.type('application/json')
                res.json({message: "Error creating event in Google Calendar."})
                return
            })
        }
        res.status(200)
        res.type('application/json')
        res.json({message: "New habit creation successful"})
    }catch(err) {
        console.log(err)
        res.status(401)
        res.type('application/json')
        res.json({message: 'New habit creation unsuccessful'})
    } 
})

app.get('/template/:id', jwtSecurity, async (req, res) => {
    const habitId = req.params['id']

    try {
        const templateResult = await sqlQueryTemplate([habitId])
        const template = templateResult[0]

        res.status(200)
        res.type('application/json')
        res.json(template)    
    }catch(err) {
        res.status(401)
        res.type('application/json')
        res.json({message: 'New habit creation unsuccessful'})
    }  
})

app.get('/queryrecords/:id', jwtSecurity, async (req, res) => {
    const habitId = parseInt(req.params['id'])

    try{
        const queryRecordResult = await mongo.db(process.env.MONGO_DB)
        .collection(process.env.MONGO_COLLECTION)
        .aggregate([
            {
                $match: { 
                    habitID: habitId
                }
            },
            {
                $sort: { date: -1 }
            },
            {
                $group: {
                    _id: "$habitID",
                    records: { 
                        $push: {
                            recordID: "$_id",
                            value: "$value",
                            date: "$date",
                            comments: "$comments"
                        }
                    }
                }
            }
        ]).toArray()
        console.log(queryRecordResult)
        res.status(200)
        res.type('application/json')
        res.json(queryRecordResult)
    }catch(err) {
        res.status(401)
        res.type('application/json')
        res.json({message: `Query for habit records of habitID "${habitID}" unsuccesful`})
    }
})

app.post('/createrecord', jwtSecurity, async (req, res) => {
    const data = req.body
    console.log("creating record: ", data)
    let recordId
    const conn = await pool.getConnection()
    try {
        await conn.beginTransaction

        const newRecordResult = await mongo.db(process.env.MONGO_DB)
        .collection(process.env.MONGO_COLLECTION)
        .insertOne({
            habitID: data.hId,
            value: data.value,
            date: data.date,
            comments: data.comments
        })
        this.recordId = newRecordResult.ops[0]['_id']

        const [result, _] = await conn.query(SQL_CREATE_RECORD, [data.hId, req.token.sub, this.recordId.toString()])
        await conn.commit()

        res.status(201)
        res.type('application/json')
        res.json({recordID: this.recordId})
    }catch(err) {
        conn.rollback()
        const deletedMongo = await mongo.db(process.env.MONGO_DB)
        .collection(process.env.MONGO_COLLECTION)
        .deleteOne( { "_id": ObjectId(this.recordId) } )
        console.log(deletedMongo)
        res.status(401)
        res.type('application/json')
        res.json({message: 'New record creation unsuccessful'})
    }finally {
        conn.release()
    }
})

//promise function for SQL database
const p0 = (async () => {
    const conn = await pool.getConnection()
    console.log('Pinging SQL database...')
    await conn.ping()
    console.log('SQL database alive.')
    conn.release()
    return true
})()

// promise function for mongoDB
const p1 = (async () => {
    console.log('Pinging MongoDB...')
    await mongo.connect()
    console.log('MongoDB alive.')
    return true
})()

//starting application server
Promise.all([p0, p1])
.then((r) => {
    app.listen(PORT, () => {
        console.log(`Application started at port ${PORT}, on ${new Date()}.`)
    })
})
