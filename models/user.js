const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    signupName: {type: String},
    signupUsername: {type: String},
    signupPassword: {type: String},
    signupRole: {type: String},
    signupEmail: {type: String},
    signupNumber: {type: Number},
    signupGender: {type: String},
    signupAddress: {type: String}
});

module.exports = mongoose.model('User', registerSchema);