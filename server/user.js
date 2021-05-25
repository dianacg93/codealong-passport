const mongoose = require('mongoose')

const user = mongoose.Schema({
    username: {type: String},
    password: {type: String}
})

module.exports = mongoose.model("User", user)