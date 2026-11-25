// ============================================================
// FOOD MODEL - MongoDB Schema for Food Items
// ============================================================

// Import mongoose - library for creating MongoDB database schemas and models
import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
     },
    description: {
         type: String, 
         required: true 
        },
    price: {
         type: Number,         
         required: true 
        },
    image: {
         type: String,
          required: true 
        },
    category: {
        type: String, 
        required: true
        }

// Schema options: { timestamps: true }
// This automatically adds:
//   - createdAt: timestamp when food item was created in database
//   - updatedAt: timestamp when food item was last modified
// Example: "2025-01-24T10:30:45.123Z"
// Useful for: tracking when foods were added, filtering by date, audit trails
}, { timestamps: true })


// ============================================================
// CREATE FOOD MODEL
// ============================================================

// Create or retrieve the "food" model
// Logic explanation:
//   - mongoose.models.food: Check if model already exists (prevents duplicate model errors)
//   - If EXISTS: Use the existing model
//   - If NOT EXISTS: Create new model using foodSchema
// Why this matters: In development, server restarts can try to create model multiple times
// This pattern prevents "Cannot overwrite model" errors
//
// Model name: "food" (MongoDB creates collection "foods" automatically - adds 's')
// Schema: foodSchema (the structure defined above)
//
// Result: foodModel is used in controllers to:
//   - CREATE new food items: foodModel.create({name, description, price, image, category})
//   - READ foods: foodModel.find(), foodModel.findById(id)
//   - UPDATE foods: foodModel.findByIdAndUpdate(id, data)
//   - DELETE foods: foodModel.findByIdAndDelete(id)
const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);


// ============================================================
// EXPORT MODEL
// ============================================================

// Export foodModel so other files can import and use it
// Usage in foodController.js:
//   import foodModel from '../models/foodModel.js'
//   Then call: foodModel.find(), foodModel.create(), etc.
export default foodModel;
