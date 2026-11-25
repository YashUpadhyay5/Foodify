import userModel from '../models/userModel.js';

// ================= ADD TO CART =================
// Adds an item to the user's cart
// Route: POST /api/cart/add
// Expects:
//   req.body.userId → Logged-in user's ID
//   req.body.itemId → Food item ID to add
const addToCart = async (req, res) => {
    try {
        // Fetch user data from database using userId
        //req.body.userId  jo auth middleware se a rha hai  token se le rahe hai 
        let userData = await userModel.findById(req.body.userId);

        // Get user's cart data object
        // cartData structure: { itemId: quantity }
        let cartData = userData.cartData;

        // If item does not exist in cart, add it with quantity 1
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            // If item already exists, increase quantity
            cartData[req.body.itemId] += 1;
        }

// itemid cpme from this function in frontend
//         const addToCart = async (itemId) => {
//     if (!cartItems[itemId]) {
//         setCartItems(prev => ({ ...prev, [itemId]: 1 })); '///setCarsItem({...prev,[itemid]:1})
//     } else {
//         setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
//     }

//     if (token) {
//         await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
//     }
// };


//         Frontend:
// -----------------------------        
// | Click "Add Pizza" button  |
// | axios.post("/cart/add",   |
// |   { itemId: "pizza123" } |
// -----------------------------

// Backend:
// -----------------------------
// req.body = {
//   itemId: "pizza123",
//   userId: "user456"
// }

// cartData = {
//   "pizza123": 2,
//   "burger456": 1
// }

// if cartData[itemId] exists → increase
// else → add 1
// -----------------------------


        // Update user's cart in database
        // Save updated cart data to the database
// - req.body.userId: the ID of the logged-in user (from JWT)
// - cartData: the updated cart object
// This ensures the user's cart changes persist in MongoDB


        await userModel.findByIdAndUpdate(req.body.userId, { cartData });

        // Send success response to frontend
        res.json({
            success: true,
            message: "Added to cart"
        });

    } catch (error) {
        console.log(error);
        // Send error response if something fails
        res.json({
            success: false,
            message: "Error"
        });
    }
};

// ================= REMOVE FROM CART =================
// Removes one quantity of an item from the user's cart
// Route: POST /api/cart/remove
// Expects:
//   req.body.userId → Logged-in user's ID
//   req.body.itemId → Food item ID to remove
const removeFromCart = async (req, res) => {
    try {
        // Fetch user data from database
        let userData = await userModel.findById(req.body.userId);

        // Get cart data object
        let cartData = userData.cartData;

        // Reduce item quantity only if it exists and quantity > 0
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }

        // Update user's cart in database
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });

        // Send success response
        res.json({
            success: true,
            message: "Item removed from cart"
        });

    } catch (error) {
        console.log(error);
        // Send error response
        res.json({
            success: false,
            message: "Error"
        });
    }
};

// ================= GET USER CART =================
// Fetches complete cart data for logged-in user
// Route: POST /api/cart/get
// Expects:
//   req.body.userId → Logged-in user's ID
// Returns:
//   cartData → Object containing itemId: quantity
const getCart = async (req, res) => {
    try {
        // Fetch user data from database
        let userData = await userModel.findById(req.body.userId);

        // Extract cart data
        let cartData = userData.cartData;

        // Send cart data to frontend
        res.json({
            success: true,
            cartData
        });

    } catch (error) {
        console.log(error);
        // Send error response
        res.json({
            success: false,
            message: "Error"
        });
    }
};

// Export controller functions
export { addToCart, removeFromCart, getCart };




//     Button.onClick()
//    ↓
// addToCart(itemId)
//    ↓
// setCartItems(prev => {...})
//    ↓
// axios.post("/api/cart/add")
//    ↓
// router.post("/add", authMiddleware, addToCart)
//    ↓
// authMiddleware(req, res, next)
//    ↓
// jwt.verify(token, JWT_SECRET)
//    ↓
// addToCart(req, res)   // controller
//    ↓
// userModel.findById(userId)
//    ↓
// userModel.findByIdAndUpdate(userId, { cartData })
//    ↓
// res.json({ success: true })
