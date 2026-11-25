// ============================================================
// FOOD CONTROLLER - Business logic for food operations
// ============================================================

// Import Food MongoDB model
// This model defines the structure of food documents in MongoDB
// (name, description, price, category, image, etc.)
import foodModel from "../models/foodModel.js";

// Import File System module
// Used to delete image files from server when food item is removed
import fs from "fs";


// ============================================================
// ADD FOOD CONTROLLER
// ============================================================

// Purpose:
// --------
// Handles adding a new food item to the database
// - Receives text data (name, price, category, description)
// - Receives image file (handled earlier by Multer middleware)
// - Saves image filename in MongoDB
// - Saves image file in /uploads folder (already done by Multer)
//
// Request Flow:
// -------------
// 1. Admin submits form with image + food data
// 2. Multer middleware saves image to /uploads/
// 3. Multer adds file info to req.file
// 4. This controller saves food data + image filename to MongoDB
//
// Request Type: POST
// Endpoint: /api/food/add
//
const addFood = async function (req, res) {
    
    // Extract uploaded image filename
    // Example: "1706098245123pizza.jpg"
    // This file already exists inside /uploads folder
    // Extract uploaded image filename (saved by Multer) to store in DB


    let image_filename = req.file.filename;

    // Create new Food document using request body data
    const food = new foodModel({
        name: req.body.name,             // Food name
        description: req.body.description, // Food description
        price: req.body.price,           // Food price
        category: req.body.category,     // Food category (e.g., veg, non-veg)
        image: image_filename             // Store image filename in DB
    });

    try {
        // Save food document to MongoDB
        await food.save(); // new food item saved to database  like dal makhani , paneer etc

        // Send success response to frontend
        res.json({
            success: true,
            message: "Food added successfully"  
        });

    } catch (error) {
        // Log error for debugging
        console.log(error);

        // Send error response
        res.json({
            success: false,
            message: "Error adding food"
        });
    }
};


// ============================================================
// LIST FOOD CONTROLLER
// ============================================================

// Purpose:
// --------
// Fetches all food items from the database
// Used by frontend to display food menu
//
// Request Type: GET
// Endpoint: /api/food/list
//
// Typical Usage:
// --------------
// - Homepage loads
// - StoreContext calls /api/food/list
// - User sees list of available foods
//
const listFood = async function (req, res) {
    try {
        // Fetch all food documents from MongoDB
        const foods = await foodModel.find({}); // empty {} means fetch all documents

        // Send food list to frontend
        res.json({
            success: true,    // this the response.data.sucess

            data: foods   // this is response.data.data jo frontend me use kar rahe hai
            // Send array of food items
        });

    } catch (error) {
        // Log error
        console.log(error);

        // Send error response
        res.json({
            success: false,
            message: "Error fetching food list"
        });
    }
};


// ============================================================
// REMOVE FOOD CONTROLLER
// ============================================================

// Purpose:
// --------
// Deletes a food item from database AND deletes its image from server
//
// Why delete image?
// -----------------
// If image is not deleted:
// - uploads folder keeps growing
// - unused images waste server storage
// - causes memory and disk issues over time
//
// Request Type: POST
// Endpoint: /api/food/remove
//
// Request Body:
// -------------
// {
//    "id": "food_id_here"
// }
//
// Deletion Flow:
// --------------
// 1. Find food by ID
// 2. Delete image file from /uploads folder
// 3. Delete food document from MongoDB
//
const removeFood = async function (req, res) {
    try {
        // Find food item by ID from request body
        const food = await foodModel.findById(req.body.id);

        // Delete associated image file from uploads folder
        // Example path: uploads/1706098245123pizza.jpg
        fs.unlink(`uploads/${food.image}`, function () {});

        // Delete food document from MongoDB
        await foodModel.findByIdAndDelete(req.body.id);

        // Send success response
        res.json({
            success: true,
            message: "Food removed successfully"
        });

    } catch (error) {
        // Log error
        console.log(error);

        // Send error response
        res.json({
            success: false,
            message: "Error removing food"
        });
    }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

// Export controller functions
// These functions are imported and used inside foodRoute.js
export { addFood, listFood, removeFood };
