// ============================================================
// IMPORTS - All required dependencies and modules
// ============================================================

import express from 'express'           // Express framework for creating HTTP server
import cors from 'cors'                 // CORS middleware - allows requests from different domains (needed for frontend)
import fs from 'fs'                     // File system module for directory verification
import { connectDB } from './config/db.js'  // Function to connect to MongoDB database
import foodRouter from './routes/foodRoute.js'   // API routes for food items (GET all foods, GET by ID, ADD, UPDATE, DELETE)
import userRouter from './routes/userRoute.js'   // API routes for user authentication (login, register)
import 'dotenv/config'                  // Load environment variables from .env file (PORT, DB_URI, etc.)
import cartRouter from './routes/cartRoute.js'   // API routes for shopping cart (add to cart, remove from cart, get cart)
import orderRouter from './routes/orderRoute.js' // API routes for orders (place order, get orders, verify payment)


// ============================================================
// APP CONFIGURATION
// ============================================================

// Create Express application instance - this is the server object
const app = express()

// Set port from environment variable or default to 4000 if not provided in .env
// Example: process.env.PORT comes from .env file or system environment
const port = process.env.PORT || 4000


// ============================================================
// MIDDLEWARE CONFIGURATION
// ============================================================

// Middleware 1: express.json()
// Purpose: Parse incoming JSON request bodies (body size limit)
// When frontend sends POST request with JSON data, this middleware converts it to JavaScript object
// Example: Frontend sends {"email": "user@example.com"} → becomes JS object that route handlers can use
app.use(express.json())

// Middleware 2: cors()
// Purpose: Enable Cross-Origin Resource Sharing (CORS)
// Allows frontend (running on http://localhost:3000) to make requests to backend (http://localhost:4000)
// Without this, browser blocks frontend → backend requests due to same-origin policy
// Think of it as giving permission: "Yes, frontend can talk to this backend"
app.use(cors())


// ============================================================
// DATABASE CONNECTION
// ============================================================

// Call connectDB() function - connects to MongoDB using connection string from .env
// This happens when server starts, before routes are defined
// If connection fails, error will be logged in console
connectDB();


// ============================================================
// API ROUTES - Define all API endpoints the frontend can call
// ============================================================

// Route 1: Food API Endpoints (foodRouter handles all food-related requests)
// Endpoints: GET /api/food (list all foods), GET /api/food/:id (single food), POST /api/food (admin add food), etc.
// Frontend calls these to: fetch food list, get food details, add/edit/delete foods (admin)
app.use('/api/food', foodRouter)  //for foodroutes only

// Route 2: Static File Server
// Ensure uploads directory exists on server start (vital for fresh deployments like Render)
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
// Purpose: Serve uploaded images from 'uploads' folder
// When frontend requests image, it calls: GET /images/food_image_123.jpg
// Server responds with actual image file from uploads folder
app.use('/images', express.static('uploads'))

// Route 3: User Authentication API Endpoints (userRouter handles login/register)
// Endpoints: POST /api/user/register (create new user), POST /api/user/login (authenticate user)
// Frontend calls these to: register new account, login to existing account
// Returns: JWT token (if successful) - used for authenticating other requests
app.use('/api/user', userRouter)

// Route 4: Cart API Endpoints (cartRouter handles cart operations)
// Endpoints: POST /api/cart/add (add item), POST /api/cart/remove (remove item), GET /api/cart (get cart data)
// Frontend calls these to: add/remove items from shopping cart, retrieve user's current cart
// Requires: JWT token (user must be logged in)
app.use('/api/cart', cartRouter)

// Route 5: Order API Endpoints (orderRouter handles order operations)
// Endpoints: POST /api/order/place (create order), GET /api/order/userorders (list user's orders), POST /api/order/verify (verify payment)
// Frontend calls these to: place new order, view order history, verify payment after checkout
// Requires: JWT token (user must be logged in)
app.use('/api/order', orderRouter)


// ============================================================
// HEALTH CHECK ENDPOINT
// ============================================================

// Simple GET endpoint to verify server is running
// Frontend or admin can call GET http://localhost:4000/ to check if backend is online
// Useful for: debugging, monitoring, health checks, testing if server is alive
app.get("/", (req, res) => {
    res.send("API Working")  // Returns simple text response
})


// ============================================================
// START SERVER - Listen for incoming requests
// ============================================================

// Start Express server - listens on specified port for HTTP requests
// Once started, all routes above become available for frontend to call
// Example: http://localhost:4000/api/food, http://localhost:4000/api/user/login, etc.
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)  // Log message when server starts successfully
})

