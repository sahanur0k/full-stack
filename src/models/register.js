const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    roll_number: {
        type: String,
        required: true
    },
    registration_number: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    photo: {  // Add the photo field for storing file path
        type: String,
        required: false // This can be optional, as not all users may upload a photo
    }
});

const Register = mongoose.model("Register", userSchema);

module.exports = Register;
