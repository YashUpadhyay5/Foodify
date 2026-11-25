// ============================================================
// FOOD ROUTES - API endpoints for food operations
// ============================================================

// Import Express for routing
import express from "express";

// Import food controller functions
// addFood: Creates new food item with image upload
// listFood: Gets all foods from database
// removeFood: Deletes food item from database
import { addFood, listFood, removeFood } from "../controllers/foodController.js";

// ============================================================
// MULTER - FILE UPLOAD MIDDLEWARE
// ============================================================

// Import multer - middleware for handling file uploads (images, documents, etc.)
// 
// WHY IS MULTER NECESSARY?
// ========================
// Problem: Express cannot handle file uploads by default
// - express.json() only handles JSON data
// - Images are binary files (not JSON) - they need special handling
// - Without multer, admin cannot upload food images when adding new food items
//
// What multer does:
// - Intercepts file upload requests
// - Saves uploaded files to server (in 'uploads' folder)
// - Makes file info available to route handlers
// - Validates file types and sizes (if configured)
//
// Real-world flow:
// 1. Admin fills form: name="Biryani", price=12.99, image=<file>
// 2. Frontend sends POST /api/food/add with FormData including image file
// 3. Multer intercepts request, saves image to 'uploads' folder
// 4. Route handler receives: req.body (text fields) + req.file (image info)
// 5. Controller saves to MongoDB: {name, price, image: "filename.jpg"}
// 6. Frontend fetches image from: /images/filename.jpg
//
// IS IT NECESSARY? YES, absolutely!
// Without multer: File upload crashes or fails silently
// Without multer: Admins cannot add food items with images
// Without multer: Images cannot be displayed in frontend
import multer from 'multer';


// ============================================================
// CONFIGURE MULTER - DISK STORAGE ENGINE
// ============================================================

// Create multer storage configuration using diskStorage
// diskStorage: Saves files directly to server's file system (not in memory)
// Why diskStorage? Because memory storage would crash server if many files uploaded
const storage = multer.diskStorage({
    
    // destination: Where uploaded files are saved on server
    // Location: /backend/uploads/ folder
    // Admin uploads image → saved as /backend/uploads/image_filename.jpg
    destination: "uploads",
    
    // filename: Function to determine the name of saved file
    // Parameters:
    //   - req: HTTP request object
    //   - file: Upload file info {originalname, mimetype, size, etc.}
    //   - cb: Callback function to pass filename
    //
    // Logic: `${Date.now()}${file.originalname}`
    // Example: 1706098245123pizza.jpg
    // Why? Makes filename unique (timestamp + original name)
    // Prevents: overwriting if two admins upload "pizza.jpg" simultaneously
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
})

// Create upload middleware instance with storage configuration
// This middleware will be used in routes below
const upload = multer({ storage: storage })


// ============================================================
// CREATE ROUTER
// ============================================================

// Create Express router for food routes
const foodRouter = express.Router();


// ============================================================
// DEFINE ROUTES
// ============================================================

// Route 1: POST /api/food/add
// Purpose: Admin adds new food item with image
// Middleware: upload.single("image")
//   - "image": field name that frontend sends in FormData
//   - single: only one file (not multiple)
//   - Does: Intercepts request, saves image to /uploads/, passes to addFood handler
// Handler: addFood controller function
// Frontend usage: Admin fills form → submits POST /api/food/add with image file
// Result: New food item created in MongoDB with image saved in /uploads/
foodRouter.post("/add", upload.single("image"), addFood)

// Route 2: GET /api/food/list
// Purpose: Frontend fetches all food items to display
// Middleware: None (no file upload needed)
// Handler: listFood controller function
// Frontend usage: When app loads, StoreContext calls GET /api/food/list
// Result: Returns array of all foods: [{_id, name, price, image, category}, ...]
foodRouter.get("/list", listFood)

// Route 3: POST /api/food/remove
// Purpose: Admin deletes food item from database
// Middleware: None (no file upload needed)
// Handler: removeFood controller function
// Request body: {id: food_id_to_delete}
// Frontend usage: Admin clicks delete button → sends POST /api/food/remove
// Result: Food item deleted from MongoDB
foodRouter.post("/remove", removeFood);  // jo / k bad hai vo end point hota hai 


// ============================================================
// EXPORT ROUTER
// ============================================================

// Export foodRouter so server.js can use it
// Usage in server.js: app.use('/api/food', foodRouter)
// This makes all routes above available at: /api/food/add, /api/food/list, /api/food/remove
export default foodRouter;

