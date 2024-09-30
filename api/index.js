require('dotenv').config(); // Ensure this is at the top
const express = require('express');
const app = express();
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const imageDownloader = require('image-downloader');
const fs = require('fs');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || 'vguhjhgsrttf2554gh78vhg5fxvb8gdftxb3';

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        reject('Invalid token');
      } else {
        resolve(userData);
      }
    });
  });
}

app.get('/api/test', (req, res) => {
  res.json('test passed');
});

// Register route
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json({ error: e.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ email: userDoc.email, id: userDoc._id }, jwtSecret, {}, (err, token) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to generate token' });
        }
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json({ error: 'Incorrect Password' });
    }
  } else {
    return res.status(404).json({ error: 'User not found' });
  }
});

// Profile route
app.get('/api/profile', async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) return res.status(401).json({ error: 'Invalid token' });
      const user = await User.findById(userData.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { name, email, _id } = user;
      res.json({ name, email, _id });
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout Route
app.post('/api/logout', (req, res) => {
  res.cookie('token', '', { maxAge: 0 }).json(true);
});

// Upload by link
app.post('/api/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const newName = 'photo' + Date.now() + '.jpg';
  try {
    await imageDownloader.image({
      url: link,
      dest: __dirname + '/uploads/' + newName,
    });
    res.json(newName);
  } catch (err) {
    res.status(500).json({ error: 'Failed to download image' });
  }
});

// Photos middleware
const photosMiddleware = multer({ dest: 'uploads/' });
app.post('/api/upload', photosMiddleware.array('photos', 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace('uploads/', ''));
  }
  res.json(uploadedFiles);
});

app.post('/api/user-places/add', async (req, res) => {
  const { email, place } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Fetch the place by ID
    const placeData = await Place.findById(place);
    if (!placeData) return res.status(404).json({ error: 'Place not found' });

    // Add the place ID to the user's places array
    user.places.push(placeData); // Push the place's ObjectId

    // Save the updated user document
    await user.save();

    // Respond with the updated places array
    res.json(user.places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get places of a user by email
app.post('/api/user-places', async (req, res) => {
  const { email } = req.body; // Get the email from the query parameters

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Respond with the user's places
    res.json(user.places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete a place by email and index
app.delete('/api/user-places', async (req, res) => {
  const { email, index } = req.body; // Get email and index from the request body

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if the index is valid
    if (index < 0 || index >= user.places.length) {
      return res.status(400).json({ error: 'Invalid index' });
    }

    // Remove the place at the specified index
    user.places.splice(index, 1); // Remove the place at the given index

    // Save the updated user document
    await user.save();

    // Respond with the updated places array
    res.json(user.places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/places', async (req, res) => {
  const { token } = req.cookies;
  const {
    title,
    address,
    photos,
    description,
    price,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;

  try {
    const userData = await getUserDataFromReq(req);

    const placeDoc = await Place.create({
      owner: userData.id,
      price,
      title,
      address,
      photos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });

    res.json(placeDoc);
  } catch (err) {
    console.error(err); // Log the error to the console for debugging
    res.status(500).json({ error: err.message });
  }
});



// User places
app.get('/api/user-places', async (req, res) => {
  const { token } = req.cookies;
  try {
    const userData = await getUserDataFromReq(req);
    const places = await Place.find({ owner: userData.id });
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get place by ID
app.get('/api/places/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const place = await Place.findById(id);
    if (!place) return res.status(404).json({ error: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/places', async (req, res) => {
  const { token } = req.cookies;
  const {
    title, address, addedPhotos, description, price,
    perks, extraInfo, checkIn, checkOut, maxGuests,
  } = req.body;

  try {
    const userData = await getUserDataFromReq(req);
    const placeDoc = await Place.create({
      owner: userData.id,
      price,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });
    res.json(placeDoc);
  } catch (err) {
    console.error(err); // Log the error to the console
    res.status(500).json({ error: err.message });
  }
});


// Get all places
app.get('/api/places', async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookings route
app.post('/api/bookings', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;
    const booking = await Booking.create({
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      user: userData.id,
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User bookings
app.get('/api/user-bookings', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    const bookings = await Booking.find({ user: userData.id }).populate('place');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(4000, () => {
  console.log('Server running on port 4000');
});
