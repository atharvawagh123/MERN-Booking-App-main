const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the UserSchema
const UserSchema = new Schema({
  name: { type: String, required: true }, // Add required validation
  email: { type: String, unique: true, required: true }, // Add required validation
  password: { type: String, required: true }, // Add required validation
  places: [],
});

// Create the UserModel from the schema
const UserModel = mongoose.model('User', UserSchema);

// Export the UserModel
module.exports = UserModel;
