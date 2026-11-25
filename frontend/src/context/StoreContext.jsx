import { createContext, useEffect, useState } from "react";
import axios from 'axios';

// ================= STORE CONTEXT =================
// Create a global context to share cart, food list, and auth state across components
export const StoreContext = createContext(null);

// ================= STORE CONTEXT PROVIDER =================
// Wraps the app and provides all shared state and functions
// Props:
//   props.children: All components wrapped by this provider will have access to context
const StoreContextProvider = (props) => {

    // ================= STATE =================
    // Cart items: Object storing { itemId: quantity }
    const [cartItems, setCartItems] = useState({});

    // User authentication token (empty string if not logged in)
    const [token, setToken] = useState("");

    // List of all food items fetched from backend
    const [food_list, setFoodList] = useState([]);

    // ================= BACKEND API URL =================
    // Base URL for backend API
    // Allows flexibility between development (local) and production (live) environments

    // Option 1: Use environment variable (recommended for dev/prod flexibility)
    // Set in .env file: VITE_API_URL="http://localhost:4000"
    // import.meta.env.VITE_API_URL reads this variable at build time
    // If variable is not set, fallback to production URL
    const url = import.meta.env.VITE_API_URL || "https://cravio-backend-gkqq.onrender.com";

    // ---------------- EXAMPLES / ALTERNATIVES ----------------
    // Hardcode local backend (for local dev testing only)
    // const url = "http://localhost:4000";

    // Hardcode production backend (if you want to ignore environment variable)
    // const url = "https://cravio-backend.onrender.com";

    // ---------------- DEBUGGING ----------------
    // Console log to confirm which backend the frontend will call
    console.log('API base URL:', url);

    // ================= CART FUNCTIONS =================
    // Add an item to cart
    const addToCart = async (itemId) => {
        // Update cart state locally
        if (!cartItems[itemId]) {
            setCartItems(prev => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }

        // If user is logged in, sync cart with backend 
        // Send POST request to /api/cart/add with itemId
        //
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    };
    /*
ADD TO CART – COMPLETE FUNCTION FLOW

Button.onClick()
  → addToCart(itemId)                     // Frontend handler (on button click)
      → setCartItems(prev => {...})       // Update UI immediately (optimistic UI)
      → axios.post("/api/cart/add")       // API call to backend with itemId + token

Express Router
  → router.post("/add", authMiddleware, addToCart)

authMiddleware(req, res, next)            // Backend auth layer
  → jwt.verify(token, JWT_SECRET)         // Verify JWT token
  → req.body.userId = decoded.id          // Attach userId from token
  → next()                                // Pass control to controller

addToCart(req, res)                       // Cart controller
  → userModel.findById(userId)            // Fetch user from MongoDB
  → update cartData[itemId]               // Add or increment item quantity
  → userModel.findByIdAndUpdate(userId)   // Save updated cart to DB
  → res.json({ success: true })            // Send response to frontend
*/


    // Remove an item from cart
    const removeFromCart = async (itemId) => {
        // Reduce quantity locally
        setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] - 1 }));

        // If user is logged in, sync removal with backend
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    };

    // Calculate total cart amount
    const getTotalCartAmount = () => {
        let totalAmount = 0;

        // Loop through cart items
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                // Find item info from food list
                let itemInfo = food_list.find(product => product._id === item);
                if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    };

    // ================= DATA FETCHING FUNCTIONS =================
    // Fetch all food items from backend
//     | Level                | Meaning               |
// | -------------------- | --------------------- |
// | `response`           | Axios response object |
// | `response.data`      | JSON sent by backend  |
// | `response.data.data` | Food list array       |





    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            if (response.data && response.data.data) {
                setFoodList(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch food list:", err);
        }
    };

    // Load cart data from backend for logged-in user with guest-cart preservation
    const loadCartData = async (token) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { token } });
            if (response.data && response.data.cartData) {
                const backendCart = response.data.cartData;
                setCartItems(prev => {
                    // Check if user had added any items before logging in
                    const hasLocalItems = prev && Object.values(prev).some(qty => qty > 0);
                    if (hasLocalItems) {
                        const merged = { ...backendCart };
                        // Merge local items and sync each added item to backend
                        for (const itemId in prev) {
                            if (prev[itemId] > 0) {
                                merged[itemId] = (merged[itemId] || 0) + prev[itemId];
                                for (let i = 0; i < prev[itemId]; i++) {
                                    axios.post(url + "/api/cart/add", { itemId }, { headers: { token } }).catch(() => {});
                                }
                            }
                        }
                        return merged;
                    }
                    return backendCart;
                });
            }
        } catch (err) {
            console.error("Failed to load cart data:", err);
        }
    };

    // ================= LIFECYCLE HOOK =================
    // Runs once when component mounts
    useEffect(() => {

        // After page refresh, React state is lost
// Here we are NOT using setToken (no React state)
// App depends directly on localStorage for token

        async function loadData() {
            // Fetch all food items
            await fetchFoodList();

            // If token exists in localStorage, set token and load cart
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                await loadCartData(savedToken);
            }
        }

        loadData();
    }, []);
//     Website Opens
//       │
//       ▼
// Component Mounts
//       │
//       ▼
// useEffect() runs once
//       │
//       ▼
// loadData() called
//       │
//       ▼
// fetchFoodList()
//       │
//       ▼
// Food data comes from backend
//       │
//       ▼
// Food list state updates
//       │
//       ▼
// Check localStorage
//       │
//       ▼
// token exists?
//       │
//  ┌────┴─────┐
//  │          │
// No         Yes
//  │          │
//  ▼          ▼
// Stop    setToken(savedToken)
//              │
//              ▼
//      loadCartData(savedToken)
//              │
//              ▼
// Backend returns user's cart
//              │
//              ▼
// Cart state updates
//              │
//              ▼
// Website is fully initialized

    // ================= CONTEXT VALUE =================
    // Functions and state shared across all components
    const contextValue = {
        food_list,          // All available food items
        cartItems,          // Current cart items
        setCartItems,       // Setter for cart (rarely used directly)
        addToCart,          // Function to add item to cart
        removeFromCart,     // Function to remove item from cart
        getTotalCartAmount, // Function to get total cart amount
        url,                // Backend API URL
        token,              // Current user token
        setToken,           // Function to set token (login/logout)
        loadCartData        // Function to load cart from backend
    };

    // ================= RETURN PROVIDER =================
    // Provide all state/functions to wrapped components
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;

/* ================= DATA & LOGIN FLOW =================

1. APP STARTS:
   - token = "" (no user logged in)
   - cartItems = {} (empty)
   - food_list = []

2. useEffect runs on mount:
   - fetchFoodList() retrieves all food from backend
   - Checks localStorage for token
     → If found, sets token and calls loadCartData(token)
     → cartItems updated from backend

3. ADD TO CART FLOW:
   - addToCart(itemId)
     → Updates cartItems locally
     → If logged in, POST request to /api/cart/add
   - Cart total updated automatically via getTotalCartAmount()

4. REMOVE FROM CART FLOW:
   - removeFromCart(itemId)
     → Reduces quantity locally
     → If logged in, POST request to /api/cart/remove

5. GET TOTAL CART AMOUNT:
   - Loops through cartItems
   - Multiplies item quantity by price from food_list
   - Returns total cost for display (e.g., in Navbar)

6. LOGIN / TOKEN FLOW:
   - User logs in via LoginPopup → setToken(token)
   - token saved to StoreContext + localStorage
   - Navbar sees token → switches from "Sign in" to profile menu

7. LOGOUT FLOW:
   - setToken("") clears token
   - localStorage.removeItem("token")
   - cartItems can remain or be cleared based on backend logic
   - Navbar shows "Sign in" button again

================ END OF STORE FLOW ================= */

// when refershthe page this logic flow to set the token and cart data from backend
// USER LOGIN
//    ↓
// token saved in localStorage

// PAGE REFRESH
//    ↓
// React state resets (but we are NOT using state)
//    ↓
// useEffect runs
//    ↓
// loadData() is called
//    ↓
// fetchFoodList()           → load public data
//    ↓
// localStorage.getItem("token")
//    ↓
// loadCartData(token)       → restore cart directly
//    ↓
// UI works ONLY where token is read manually
