import mongoose from 'mongoose';

/*
 USER SCHEMA
 This schema defines how a user document will be stored in MongoDB.
 Each field represents a property of the user.
*/
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true
    },

    // User's email (must be unique for login)
    email: {
      type: String,
      required: true,
      unique: true
    },

    // Encrypted password (hashed using bcrypt)
    password: {
      type: String,
      required: true
    },

    /*
     cartData stores user's cart items
     Structure:
     {
       itemId1: quantity,
       itemId2: quantity
     }

     Example:
     cartData: {
       "pizza123": 2,
       "burger456": 1
     }

     type: Object → because itemId is dynamic
     default: {} → new users start with empty cart
    */
    cartData: {
      type: Object,
      default: {}
    }
  },
  {
    /*
     minimize: false
     ----------------

     By default, Mongoose removes empty objects.
     Setting minimize:false ensures cartData remains stored
     even when it's empty ({}).
     Should empty objects {} be saved in MongoDB or removed?

     This is IMPORTANT for cart functionality.
    */
    minimize: false
  }
);

/*
 Model Creation
 ----------------
 Prevents model overwrite error in development
 (especially with hot-reload / nodemon)

 mongoose.models.user → reuse existing model if already created
 mongoose.model("user", userSchema) → create new model otherwise
*/
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
/*
==================== AUTH + CART COMPLETE FLOW ====================

1️⃣ LOGIN FLOW
------------------------------------------------
User clicks Login button
  → handleLogin(email, password)                 // Frontend (Login.jsx)
      → axios.post("/api/user/login")             // API call
      → backend loginController()                 // Verifies credentials
      → jwt.sign({ id: userId })                  // Token created
      → res.json({ token })                       // Token sent to frontend
      → localStorage.setItem("token", token)      // Token stored in browser


2️⃣ ADD TO CART FLOW
------------------------------------------------
User clicks "Add" button
  → addToCart(itemId)                             // Frontend (CartContext.jsx)
      → setCartItems(prev => {...})               // UI updated instantly
      → axios.post("/api/cart/add",               // API call
            { itemId },
            { headers: { token } }
        )

Express Router
  → router.post("/add", authMiddleware, addToCart)

authMiddleware(req, res, next)                    // Backend (auth.js)
  → jwt.verify(token, JWT_SECRET)                 // Validate token
  → req.body.userId = decoded.id                  // Attach userId
  → next()                                        // Call controller

addToCart(req, res)                               // Backend (cartController.js)
  → userModel.findById(userId)                    // Fetch user from DB
  → update cartData[itemId]                       // Add / increment item
  → userModel.findByIdAndUpdate(userId, cartData) // Save to MongoDB
  → res.json({ success: true })                   // No cartData returned


3️⃣ PAGE RELOAD / APP START FLOW
------------------------------------------------
React app loads
  → useEffect(() => getCart(), [])                // Frontend (CartContext.jsx)

getCart()                                         // Frontend function
  → axios.post("/api/cart/get", {},               // API call
        { headers: { token } }
    )

Express Router
  → router.post("/get", authMiddleware, getCart)

authMiddleware(req, res, next)                    // Backend
  → jwt.verify(token)
  → req.body.userId = decoded.id
  → next()

getCart(req, res)                                 // Backend controller
  → userModel.findById(userId)                    // Fetch user
  → res.json({ success: true, cartData })         // Send cartData

Frontend
  → response.data.cartData                        // Received from backend
  → setCartItems(cartData)                        // Restore cart UI


=================================================
KEY POINTS:
- token proves user identity
- cartData is stored ONLY in MongoDB
- addToCart updates DB but does NOT return cartData
- getCart is the ONLY API that returns cartData
=================================================
*/
