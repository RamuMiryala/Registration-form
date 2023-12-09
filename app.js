const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/registration', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for user data
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Handle registration form submission
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Simple password confirmation check
    if (password !== confirmPassword) {
        return res.status(400).send('Password and Confirm Password do not match');
    }

    try {
        // Check if the username or email is already registered
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send('Username or email already exists');
        }

        // Save user data to MongoDB
        const newUser = new User({
            username,
            email,
            password
        });

        await newUser.save();
        res.status(200).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
