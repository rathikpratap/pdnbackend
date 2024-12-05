const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    signupUsername: {type: String},
    signupPassword: {type: String},
    signupRole: {type: String}
});

module.exports = mongoose.model('User', registerSchema);