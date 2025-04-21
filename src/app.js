const express = require('express');
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const multer = require('multer'); // Import multer
require('./db/conn'); // MongoDB Connection
const Register = require('./models/register'); // Mongoose model

const app = express();
const PORT = process.env.PORT || 3000;

// Paths
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");
const public_path = path.join(__dirname, "../public");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// View Engine
app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partials_path);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('views'));
app.use(express.static('public'));

// File upload setup using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        // Allow only images and videos
        const fileTypes = /jpeg|jpg|png|gif|mp4|mov/;
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        }
        cb('Error: File upload only supports the following file types: JPEG, PNG, GIF, MP4, MOV');
    }
}).single('file'); // Expecting a single file upload with name 'file'

// Routes

// Home Page: Registration Form
app.get("/", (req, res) => {
    res.render("register");
});

// Handle POST: Save Registration Data
app.post("/register", upload, async (req, res) => {
    try {
        const userData = new Register({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            roll_number: req.body.roll_number,
            registration_number: req.body.registration_number,
            semester: req.body.semester,
            department: req.body.department,
            event: req.body.event,
            photo: req.file ? req.file.path : undefined, // Save the file path in the DB
        });

        await userData.save();
        res.status(201).send("Registration Successful!");
    } catch (error) {
        res.status(400).send("Error while registering: " + error);
    }
});

// Admin Page: List All Registrations
app.get("/admin/registrations", async (req, res) => {
    try {
        const registrations = await Register.find();
        res.render("registrations-list", { registrations });
    } catch (error) {
        res.status(400).send("Error loading registrations: " + error);
    }
});

// Admin: Edit Form Route
app.get("/admin/edit/:id", async (req, res) => {
    try {
        const user = await Register.findById(req.params.id);
        res.render("edit-registration", { user });
    } catch (error) {
        res.status(400).send("Error loading edit form: " + error);
    }
});

// Admin: Handle Update Submission
app.post("/admin/edit/:id", upload, async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            email: req.body.email,
            roll_number: req.body.roll_number,
            registration_number: req.body.registration_number,
            semester: req.body.semester,
            department: req.body.department,
            event: req.body.event,
        };

        if (req.file) {
            updatedData.photo = req.file.path; // Update photo if a new file is uploaded
        }

        await Register.findByIdAndUpdate(req.params.id, updatedData);
        res.redirect("/admin/registrations");
    } catch (error) {
        res.status(400).send("Error updating data: " + error);
    }
});

// Admin: Delete a Registration
app.get("/admin/delete/:id", async (req, res) => {
    try {
        await Register.findByIdAndDelete(req.params.id);
        res.redirect("/admin/registrations");
    } catch (error) {
        res.status(400).send("Error deleting record: " + error);
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).send("Page Not Found!");
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
