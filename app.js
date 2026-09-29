const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  city: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// POST Route for inserting users (Handles both single user and array of 5+ users)
app.post('/users', async (req, res) => {
  try {
    const data = req.body;

    // Check if data is an array
    if (Array.isArray(data)) {
      if (data.length < 5) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of users (at least 5 users)."
        });
      }
      const savedUsers = await User.insertMany(data);
      return res.status(201).json({
        success: true,
        data: savedUsers
      });
    } else {
      // If single object is sent
      const newUser = new User(data);
      const savedUser = await newUser.save();
      return res.status(201).json({
        success: true,
        data: savedUser
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Connect to MongoDB and start server safely
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });