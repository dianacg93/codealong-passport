const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const User = require('./user')

const app = express();

let MONGODB_URI = "mongodb+srv://jeff:mynameisjeff@auth-cluster.obmbt.mongodb.net/test?retryWrites=true&w=majority";
mongoose
    .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    // .then(() => {
    //     console.log('Successfully connected to MongoDB.')
    // })
    // .catch(e => {
    //     console.error('Connection error', e.message)
    // })

// ------------------ START OF MIDDLEWARE ---------------------
app.use(express.json(true))
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin: "http://localhost:3001", // <-- location of the react app we're connecting to
    credentials: true
}))

app.use(session({
    secret: "secretcode",
    resave: true,
    saveUnitialized: true
}))

app.use(cookieParser("secretcode"))

app.use(passport.initialize())
app.use(passport.session());
require('./passportConfig')(passport);
// --------------------- END OF MIDDLEWARE --------------------

// ------------------ START OF ROUTES ---------------------
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err) throw err;
        if(!user) res.send("No user exists")
        else {
            req.login(user, err => {
                if (err) throw err;
                res.send("Successfully Authenticated")
                console.log(req.user);
            })
        }
    })(req,res,next)
})

app.post("/register", (req, res) => {
    console.log(req.body);
    User.findOne({username: req.body.username}, async (err, doc) => {
        if(err) throw err;
        if(doc) res.send("User already exists")
        if(!doc) {
            const hashedPw = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                username: req.body.username,
                password: hashedPw,
            })
            await newUser.save();
            res.send("User Created")
        }
    })
})

app.get("/getUser", (req, res) => {
    res.send(req.user) //The req.user stores the entire user that has been authenticated inside of it.
})

// ------------------ END OF ROUTES ---------------------
// ------------------ START SERVER ---------------------
app.listen(4000, () => {
    console.log("Server listening on port 4000")
})