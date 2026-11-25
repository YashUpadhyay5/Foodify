import express from 'express';
import { addToCart, removeFromCart, getCart } from '../controllers/cartController.js';
import authMiddelware from '../middleware/auth.js';

// ================= CART ROUTER =================
// This router handles all cart-related API routes
// Base route example: /api/cart
const cartRouter = express.Router();

// ================= ADD TO CART =================
// Route: POST /api/cart/add
// Middleware:
//   authMiddelware → Verifies user authentication (JWT token)
// Controller:
//   addToCart → Adds an item to the user's cart
//
// Flow:
// 1. Request hits /api/cart/add
// 2. authMiddelware verifies token and extracts userId
// 3. addToCart controller updates cart in database
cartRouter.post("/add", authMiddelware, addToCart);

// ================= REMOVE FROM CART =================
// Route: POST /api/cart/remove
// Middleware:
//   authMiddelware → Ensures only logged-in users can remove items
// Controller:
//   removeFromCart → Decreases item quantity in cart
//
// Flow:
// 1. Request hits /api/cart/remove
// 2. authMiddelware validates token
// 3. removeFromCart updates cart in database
cartRouter.post("/remove", authMiddelware, removeFromCart);

// ================= GET CART DATA =================
// Route: POST /api/cart/get
// Middleware:
//   authMiddelware → Ensures user is authenticated
// Controller:
//   getCart → Fetches user's cart data from database
//
// Flow:
// 1. Request hits /api/cart/get
// 2. authMiddelware validates token and sets req.body.userId
// 3. getCart returns cartData to frontend
cartRouter.post("/get", authMiddelware, getCart);

// Export router to be used in main server file (app.js / index.js)
export default cartRouter;
