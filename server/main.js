const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const withQuery = require('with-query')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const mysql = require('mysql2/promise')
const { MongoClient, ObjectId } = require('mongodb')

//SQL Database
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'habitizer',
    connectionLimit: process.env.DB_CONN_LIMIT || 4,
    timezone: '+08:00'
})

//sql query statements
const SQL_LOGIN_AUTH = `select username from users where username = ? && password = sha1(?);`
const SQL_CREATE_USER_CHECK_USERNAME = `select count(*) as count from users where username = ?;`
const SQL_CREATE_USER_CHECK_EMAIL = `select count(*) as count from users where email_address = ?;`
const SQL_CREATE_USER = `insert into users (username, password, first_name, last_name, email_address, gender) values (?, sha1(?), ?, ?, ?, ?);`
const SQL_QUERY_HABITS = `select * from habits where username = ?;`
const SQL_CREATE_HABIT_CHECK = `select count(*) as count from habits where habit_title = ?;`
const SQL_CREATE_HABIT = `insert into habits (username, habit_title, parameter, unit, start_date, end_date, frequency) values (?, ?, ?, ?, ?, ?, ?);`
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
        } finally {
            conn.release()
        }
    }
}

//MongoDB
const MONGO_URL = 'mongodb://localhost:27017'
const MONGO_DB = 'habitizerII'
const MONGO_COLLECTION = 'records'
const mongo = new MongoClient(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})

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

//jwt token secret
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'secret'

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
                    loginTime: (new Date()).toString()
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

//constant functions
// const sqlLoginAuth = mkQuery(SQL_LOGIN_AUTH, pool)
const sqlCreateUserCheckUsername = mkQuery(SQL_CREATE_USER_CHECK_USERNAME, pool)
const sqlCreateUserCheckEmail = mkQuery(SQL_CREATE_USER_CHECK_EMAIL, pool)
const sqlCreateUser = mkQuery(SQL_CREATE_USER, pool)
const sqlCreateHabitCheck = mkQuery(SQL_CREATE_HABIT_CHECK, pool)
const sqlCreateHabit = mkQuery(SQL_CREATE_HABIT, pool)
const sqlQueryHabits = mkQuery(SQL_QUERY_HABITS, pool)
const sqlQueryTemplate = mkQuery(SQL_QUERY_TEMPLATE, pool)

const localStrategyAuth = mkAuth(passport)

// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/callback" 
// },
// function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//         return done(err, user);
//     });
// }
// ))

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

// app.get('/auth/google',
//     passport.authenticate('google', 
//         { scope: ['https://www.googleapis.com/auth/plus.login'] }
//     )
// )

// app.get('/auth/google/callback', 
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     function(req, res) {
//         res.redirect('/');
//     }
// )

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
            res.json({message: 'New account creation failed, user already exist'})
            return
        }
    await sqlCreateUser([
            newUserCred.username,
            newUserCred.password,
            newUserCred.firstname,
            newUserCred.lastname,
            newUserCred.email,
            newUserCred.gender
        ])
        res.status(201)
        res.type('application/json')
        res.json({message: "New account creation successful"})
    }catch(err) {
        res.status(401)
        res.type('application/json')
        res.json({message: 'New account creation unsuccessful'})
    }
})

app.post('/auth/local', localStrategyAuth, (req, res) => {
    const userLogin = req.userLogin
    console.log(userLogin.username)
    //add token here
    const timestamp = (new Date()).getTime() / 1000
    const token = jwt.sign({
        sub: req.userLogin.username,
        iss: 'habitizer',
        iat: timestamp,
        exp: timestamp + (1000),
        data: {
            loginTime: req.userLogin.loginTime
        }
    }, TOKEN_SECRET)
    res.status(200)
    res.type('application/json')
    res.json({successful: userLogin, token: token})
})

// app.get('/protected/secret', (req, res, next) => {
//     const token = req.get('Authorization')
//     if (null == token) {
//         res.status(403)
//         res.type('application/json')
//         res.json({message: 'Authorization failed'})
//         return
//     }
//     try {
//         const verified = jwt.verify(token, TOKEN_SECRET)
//         console.log('Verified token: ', verified)
//         req.token = verified
//         next()
//     } catch(err) {
//         res.status(403)
//         res.type('application/json')
//         res.json({message: 'Incorrect token', error: err})
//         return
//     }
// }, (req, res) => {
//     res.status(200)
//     res.type('application/json')
//     res.json({ authorized: "Token valid" })
// })

app.get('/queryhabits', jwtSecurity, async (req, res) => {
    const user = req.token.sub
    const queryHabits = await sqlQueryHabits(user)
    res.status(200)
    res.type('application/json')
    res.json({queryHabits})
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
            newHabit.enddate || null,
            newHabit.frequency || null
        ])
        if(createHabitResult.errno) {
            res.status(401)
            res.type('application/json')
            res.json({message: 'New habit creation unsuccessful'})
            return
        }
    
        res.status(200)
        res.type('application/json')
        res.json({message: "New habit creation successful"})
    }catch(err) {
        res.status(401)
        res.type('application/json')
        res.json({message: 'New habit creation unsuccessful'})
    } 
})

app.get('/template/:id', jwtSecurity, async (req, res) => {
    const habitId = req.params['id']
    // console.log(req.params)

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
    // console.log(habitId)

    //also write to sql the successfully added record ID.
    try{
        const queryRecordResult = await mongo.db(MONGO_DB)
        .collection(MONGO_COLLECTION)
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

        const newRecordResult = await mongo.db(MONGO_DB)
        .collection(MONGO_COLLECTION)
        .insertOne({
            habitID: data.hId,
            value: data.value,
            date: data.date,
            comments: data.comments
        })
        // console.log(newRecordResult.ops[0]['_id'])
        this.recordId = newRecordResult.ops[0]['_id']

        const [result, _] = await conn.query(SQL_CREATE_RECORD, [data.hId, req.token.sub, this.recordId.toString()])
        // console.log(result)
        await conn.commit()

        res.status(201)
        res.type('application/json')
        res.json({recordID: this.recordId})
    }catch(err) {
        conn.rollback()
        // console.log("recordId: ", this.recordId)
        const deletedMongo = await mongo.db(MONGO_DB)
        .collection(MONGO_COLLECTION)
        .deleteOne( { "_id": ObjectId(this.recordId) } )
        console.log(deletedMongo)
        res.status(401)
        res.type('application/json')
        res.json({message: 'New record creation unsuccessful'})
    }finally {
        conn.release()
    }
})


// app.post('/createrecord', jwtSecurity, async (req, res) => {
//     const data = req.body
//     console.log("creating record: ", data)

//     try {
//         const newRecordResult = await mongo.db(MONGO_DB)
//         .collection(MONGO_COLLECTION)
//         .insertOne({
//             habitID: data.hId,
//             value: data.value,
//             date: data.date,
//             comments: data.comments
//         })
//         console.log(newRecordResult.ops[0]['_id'])
//         const recordId = newRecordResult.ops[0]['_id']
//         res.status(201)
//         res.type('application/json')
//         res.json({recordID: recordId})
//     }catch(err) {
//         res.status(401)
//         res.type('application/json')
//         res.json({message: 'New record creation unsuccessful'})
//     }
// })

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
