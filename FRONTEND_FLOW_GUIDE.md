# 🍕 FOODIFY FRONTEND - COMPLETE FLOW GUIDE

## 📋 TABLE OF CONTENTS
1. [Architecture Overview](#architecture-overview)
2. [Global State Management (StoreContext)](#global-state-management)
3. [Component Hierarchy & Props Flow](#component-hierarchy--props-flow)
4. [Key Features & Their Flows](#key-features--their-flows)
5. [User Journey Examples](#user-journey-examples)
6. [Data Structure Reference](#data-structure-reference)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Core Technology Stack
- **React**: UI framework
- **Context API**: Global state management
- **React Router**: Page navigation
- **Axios**: API calls to backend
- **Vite**: Build tool

### Project Structure
```
frontend/
├── src/
│   ├── App.jsx                 (Root component - manages login modal state)
│   ├── main.jsx                (Entry point)
│   ├── index.css               (Global styles)
│   ├── context/
│   │   └── StoreContext.jsx    (Global state - cart, auth, foods)
│   ├── components/
│   │   ├── Navbar/             (Navigation bar)
│   │   ├── LoginPopup/         (Login/Register modal)
│   │   ├── FoodDisplay/        (Food items grid)
│   │   ├── FoodItem/           (Individual food card)
│   │   ├── ExploreMenu/        (Category menu)
│   │   ├── Footer/             (Footer)
│   │   └── ...other components
│   └── pages/
│       ├── Home/               (Home page)
│       ├── Cart/               (Shopping cart page)
│       ├── PlaceOrder/         (Checkout page)
│       ├── MyOrders/           (User's orders)
│       └── Verify/             (Payment verification)
```

---

## 🌐 GLOBAL STATE MANAGEMENT

### StoreContext.jsx - The Heart of Data Management

**Location**: `frontend/src/context/StoreContext.jsx`

#### State Variables Created:

```javascript
// ===== 1. CART STATE =====
const [cartItems, setCartItems] = useState({});
// Structure: { itemId: quantity, itemId: quantity, ... }
// Example: { "pizza123": 2, "burger456": 1 }
// Used by: FoodItem, Cart, PlaceOrder
// Updated by: addToCart(), removeFromCart()

// ===== 2. AUTHENTICATION STATE =====
const [token, setToken] = useState("");
// Stores JWT token when user logs in
// Empty string = not logged in
// Used by: Navbar, Cart, PlaceOrder
// Updated by: LoginPopup (after successful login), logout function

// ===== 3. FOOD LIST STATE =====
const [food_list, setFoodList] = useState([]);
// Array of all available foods from backend
// Structure: [{ _id, name, price, image, description, category }, ...]
// Used by: FoodDisplay, FoodItem, Cart, PlaceOrder
// Updated by: fetchFoodList() on app load

// ===== 4. BACKEND URL =====
const url = import.meta.env.VITE_API_URL || "https://cravio-backend-gkqq.onrender.com";
// Base URL for all API calls
// Used by: All components for images and API requests
```

#### Key Functions:

```javascript
// ===== ADD TO CART =====
const addToCart = async (itemId) => {
    // Updates local state immediately
    if(!cartItems[itemId]) {
        setCartItems(prev => ({...prev, [itemId]: 1}))
    } else {
        setCartItems(prev => ({...prev, [itemId]: prev[itemId]+1}))
    }
    
    // If logged in, sync with backend
    if(token) {
        await axios.post(url+"/api/cart/add", {itemId}, {headers:{token}})
    }
}

// ===== REMOVE FROM CART =====
const removeFromCart = async (itemId) => {
    // Decrease quantity
    setCartItems(prev => ({...prev, [itemId]: prev[itemId]-1}))
    
    // Sync with backend if logged in
    if(token) {
        await axios.post(url+"/api/cart/remove", {itemId}, {headers:{token}})
    }
}

// ===== GET TOTAL CART AMOUNT =====
const getTotalCartAmount = () => {
    let totalAmount = 0;
    for(const item in cartItems) {
        if(cartItems[item] > 0) {
            let itemInfo = food_list.find(product => product._id === item);
            totalAmount += itemInfo.price * cartItems[item];
        }
    }
    return totalAmount;
}

// ===== FETCH FOOD LIST =====
const fetchFoodList = async () => {
    const response = await axios.get(url+"/api/food/list");
    setFoodList(response.data.data);
}

// ===== LOAD CART DATA =====
const loadCartData = async (token) => {
    const response = await axios.post(url+"/api/cart/get", {}, {headers:{token}})
    setCartItems(response.data.cartData);
}
```

#### Context Value Exposed:

```javascript
const contextValue = {
    food_list,           // Array of all foods
    cartItems,           // Current cart items
    setCartItems,        // Set cart items directly
    addToCart,           // Function to add item
    removeFromCart,      // Function to remove item
    getTotalCartAmount,  // Function to get total
    url,                 // Backend URL
    token,               // Auth token
    setToken             // Set auth token
}
```

#### Initialization (useEffect):

```javascript
useEffect(() => {
    async function loadData() {
        // 1. Always fetch food list
        await fetchFoodList();
        
        // 2. Check if user was previously logged in
        if(localStorage.getItem("token")) {
            const savedToken = localStorage.getItem("token");
            setToken(savedToken);
            // 3. If yes, load their saved cart from backend
            await loadCartData(savedToken);
        }
    }
    loadData();
}, [])  // Runs once on app load
```

---

## 🔄 COMPONENT HIERARCHY & PROPS FLOW

### Component Tree Structure

```
App.jsx (ROOT - Manages login modal state)
│
├─── {showLogin ? <LoginPopup setShowLogin={setShowLogin}/> : <>}
│    └─ LoginPopup.jsx
│       ├─ RECEIVES: setShowLogin (prop from App)
│       ├─ USES: useContext(StoreContext) for url, setToken
│       └─ FUNCTION: Login/Register form
│
├─── <Navbar setShowLogin={setShowLogin}/>
│    └─ Navbar.jsx
│       ├─ RECEIVES: setShowLogin (prop from App)
│       ├─ USES: useContext(StoreContext) for token, getTotalCartAmount
│       ├─ SHOWS: "Sign in" button if no token, profile menu if logged in
│       └─ LINKS: Home, Menu, Cart, Orders, Logout
│
├─── <Routes>
│    ├─ <Route path="/" element={<Home/>}/>
│    │  └─ Home.jsx
│    │     ├─ Header
│    │     ├─ ExploreMenu.jsx (Category buttons)
│    │     │  └─ Clicks to filter foods
│    │     └─ FoodDisplay.jsx (Grid of foods)
│    │        └─ .map() creates FoodItem for each food
│    │           └─ FoodItem.jsx
│    │              ├─ RECEIVES: id, name, price, image, description (props)
│    │              ├─ USES: useContext for addToCart, removeFromCart, cartItems
│    │              └─ SHOWS: Food card with Add/Remove buttons
│    │
│    ├─ <Route path="/cart" element={<Cart/>}/>
│    │  └─ Cart.jsx
│    │     ├─ USES: useContext for cartItems, food_list, removeFromCart, getTotalCartAmount
│    │     ├─ SHOWS: List of items in cart with quantities and totals
│    │     └─ BUTTON: "PROCEED TO CHECKOUT" → navigate to /order
│    │
│    ├─ <Route path="/order" element={<PlaceOrder/>}/>
│    │  └─ PlaceOrder.jsx
│    │     ├─ USES: useContext for cart data
│    │     ├─ FORM: Delivery address form
│    │     └─ BUTTON: "PAY" → Stripe payment
│    │
│    ├─ <Route path="/verify" element={<Verify/>}/>
│    │  └─ Verify.jsx (Payment verification page)
│    │
│    └─ <Route path="/myorders" element={<MyOrders/>}/>
│       └─ MyOrders.jsx
│          └─ SHOWS: User's previous orders
│
└─── <Footer/>
     └─ Footer.jsx (Static footer)
```

### Props Flow Pattern

```
DATA FLOWS DOWN:
Parent → Child via props

App.jsx
  └─ PASSES: setShowLogin
       ├─ to: Navbar.jsx
       └─ to: LoginPopup.jsx (conditional)

FoodDisplay.jsx
  └─ PASSES: id, name, price, image, description
       └─ to: FoodItem.jsx (via .map())

FUNCTIONS FLOW UP (via useContext):
Child → Parent via context update

FoodItem.jsx
  ├─ CALLS: addToCart(id)
  └─ CALLS: removeFromCart(id)
       └─ UPDATES: StoreContext
            └─ AFFECTS: Navbar (cart count), Cart page, etc.
```

---

## 🎯 KEY FEATURES & THEIR FLOWS

### 1️⃣ LOGIN/AUTHENTICATION FLOW

#### Flow Diagram:
```
User clicks "Sign in" in Navbar
       ↓
Navbar button: onClick={() => setShowLogin(true)}
       ↓
App.jsx state updates: showLogin = true
       ↓
App re-renders: {showLogin ? <LoginPopup/> : <>}
       ↓
LoginPopup modal appears
       ↓
User fills email/password
       ↓
User clicks "Login" button
       ↓
LoginPopup.onLogin() sends axios.post to backend
       ↓
Backend validates credentials
       ↓
IF SUCCESS:
  - setToken(response.data.token) → saves to global state
  - localStorage.setItem("token") → saves to browser
  - setShowLogin(false) → closes modal
  - Navbar re-renders → shows profile menu instead of login button
       ↓
IF ERROR:
  - Show error alert
  - User stays on login form
```

#### Files Involved:
- `App.jsx` - Manages showLogin state
- `Navbar.jsx` - Provides "Sign in" button
- `LoginPopup.jsx` - Login form
- `StoreContext.jsx` - Stores token

#### Code Examples:

```javascript
// App.jsx
const [showLogin, setShowLogin] = useState(false);
{showLogin ? <LoginPopup setShowLogin={setShowLogin}/> : <>}
<Navbar setShowLogin={setShowLogin}/>

// Navbar.jsx
export const Navbar = ({setShowLogin}) => {
    const {token} = useContext(StoreContext);
    
    return (
        {!token ? 
            <button onClick={() => setShowLogin(true)}>Sign in</button>
        :
            <div className='navbar-profile'>
                {/* Profile menu */}
            </div>
        }
    )
}

// LoginPopup.jsx
const {url, setToken} = useContext(StoreContext);

const onLogin = async (event) => {
    event.preventDefault();
    const response = await axios.post(newUrl, data);
    
    if(response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        setShowLogin(false);
    }
}
```

---

### 2️⃣ ADD TO CART FLOW

#### Flow Diagram:
```
User sees Food Item (FoodItem.jsx)
       ↓
User clicks "Add" button
       ↓
FoodItem: onClick={() => addToCart(item._id)}
       ↓
Calls addToCart("pizza123") from StoreContext
       ↓
StoreContext.addToCart():
  1. Updates local state: cartItems["pizza123"] = 1
  2. If logged in: axios.post("/api/cart/add", {itemId})
       ↓
All components re-render with new cartItems
       ↓
FoodItem shows:
  - "Add" button → "Counter (+/-)" buttons
  - Shows quantity
       ↓
Navbar shows:
  - Red dot on cart icon (if quantity > 0)
       ↓
Cart page shows:
  - Item appears in cart table
```

#### Code Flow:

```javascript
// FoodItem.jsx
const FoodItem = ({id, name, price, image, description}) => {
    const {addToCart, removeFromCart, cartItems, url} = useContext(StoreContext);
    
    return (
        {!cartItems[id] ? 
            <button onClick={() => addToCart(id)}>Add</button>
        :
            <div>
                <button onClick={() => removeFromCart(id)}>-</button>
                <p>{cartItems[id]}</p>
                <button onClick={() => addToCart(id)}>+</button>
            </div>
        }
    )
}

// StoreContext.jsx
const addToCart = async (itemId) => {
    if(!cartItems[itemId]) {
        setCartItems(prev => ({...prev, [itemId]: 1}))
    } else {
        setCartItems(prev => ({...prev, [itemId]: prev[itemId]+1}))
    }
    
    if(token) {
        await axios.post(url+"/api/cart/add", {itemId}, {headers:{token}})
    }
}
```

#### State Changes:

```javascript
// Before clicking Add:
cartItems = {}

// After clicking Add once:
cartItems = { "pizza123": 1 }

// After clicking Add again:
cartItems = { "pizza123": 2 }

// After clicking Remove once:
cartItems = { "pizza123": 1 }

// After clicking Remove again:
cartItems = { "pizza123": 0 }
```

---

### 3️⃣ DISPLAY CART ITEMS FLOW

#### Flow Diagram:
```
Cart.jsx loads
       ↓
Gets data from StoreContext: cartItems, food_list
       ↓
food_list.map((item) => {
       ↓
For each food item:
  if(cartItems[item._id] > 0) {
    - Show in cart table
    - Display name, price, quantity, total
  }
})
       ↓
Calculate totals:
  - Subtotal: sum of all items
  - Delivery fee: ₹0 if empty, ₹2 if has items
  - Total: Subtotal + Delivery fee
       ↓
Show "PROCEED TO CHECKOUT" button
```

#### Code Example:

```javascript
// Cart.jsx
const Cart = () => {
    const {cartItems, food_list, removeFromCart, getTotalCartAmount, url} = useContext(StoreContext);
    
    return (
        {food_list.map((item) => {
            if(cartItems[item._id] > 0) {
                return (
                    <div>
                        <img src={url+"/images/"+item.image} />
                        <p>{item.name}</p>
                        <p>₹{item.price}</p>
                        <p>{cartItems[item._id]}</p>
                        <p>₹{item.price * cartItems[item._id]}</p>
                        <button onClick={() => removeFromCart(item._id)}>x</button>
                    </div>
                )
            }
        })}
        
        <p>Subtotal: ₹{getTotalCartAmount()}</p>
        <p>Delivery: ₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
        <p>Total: ₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</p>
        
        <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
    )
}
```

---

### 4️⃣ NAVIGATION FLOW

#### React Router Setup:

```javascript
// App.jsx Routes
<Routes>
    <Route path="/" element={<Home/>}/>           // Home page
    <Route path="/cart" element={<Cart/>}/>       // Shopping cart
    <Route path="/order" element={<PlaceOrder/>}/> // Checkout
    <Route path="/verify" element={<Verify/>}/>   // Payment verify
    <Route path="/myorders" element={<MyOrders/>}/>// User orders
</Routes>
```

#### Navigation Methods:

```javascript
// 1. Link Component (for page changes)
<Link to="/">Home</Link>          // No page reload, SPA navigation
<Link to="/cart">Cart</Link>

// 2. useNavigate Hook (programmatic navigation)
const navigate = useNavigate();
navigate("/order")                // Navigate after some logic
navigate("/")                      // Redirect after logout

// 3. Anchor Tags (for same-page scroll)
<a href="#explore-menu">Menu</a>  // Scrolls to section with id="explore-menu"
```

---

## 👤 USER JOURNEY EXAMPLES

### Journey 1: Browse & Add Items

```
1. App loads
   - StoreContext initializes
   - fetchFoodList() gets all foods from backend
   - food_list = [{pizza}, {burger}, {biryani}, ...]
   - cartItems = {}
   - token = "" (not logged in)

2. User visits Home page
   - Sees FoodDisplay with all foods
   - Each food = one FoodItem component
   - FoodItem shows "Add" button (no cart items yet)

3. User clicks "Add" on Pizza
   - FoodItem calls: addToCart("pizza123")
   - StoreContext updates: cartItems = {"pizza123": 1}
   - FoodItem re-renders: shows "-" and "+" buttons instead of "Add"
   - Navbar re-renders: shows red dot on cart icon

4. User clicks "+" to add another Pizza
   - FoodItem calls: addToCart("pizza123")
   - StoreContext updates: cartItems = {"pizza123": 2}

5. User adds Burger
   - FoodItem calls: addToCart("burger456")
   - StoreContext updates: cartItems = {"pizza123": 2, "burger456": 1}

6. User clicks cart icon
   - Navigates to /cart page
   - Cart.jsx shows:
     - Pizza: quantity 2, total ₹1000
     - Burger: quantity 1, total ₹300
     - Subtotal: ₹1300
     - Delivery: ₹2
     - Total: ₹1302

7. User clicks "PROCEED TO CHECKOUT"
   - navigate("/order")
   - Goes to PlaceOrder page
```

### Journey 2: Login & Checkout

```
1. User on Cart page (not logged in)
   - Sees "PROCEED TO CHECKOUT" button
   - Or clicks sign in first

2. User clicks "Sign in" in Navbar
   - Navbar calls: setShowLogin(true)
   - App.jsx state updates
   - LoginPopup appears

3. User enters email/password, clicks "Login"
   - LoginPopup sends axios.post to backend
   - Backend validates
   - Returns token if successful

4. If login success:
   - setToken(token) → StoreContext
   - localStorage.setItem("token")
   - setShowLogin(false)
   - Navbar re-renders: shows profile menu
   - CartItems saved to backend (via backend's save mechanism)

5. User proceeds to checkout
   - navigate("/order")
   - PlaceOrder page loads
   - Shows delivery form
   - Shows order summary with cart items

6. User fills delivery details
   - Name, email, address, etc.

7. User clicks "PAY"
   - Sends order data to backend
   - Backend creates order
   - Stripe payment integration
   - Shows /verify page

8. Payment successful
   - Order saved to database
   - User can view in /myorders
```

### Journey 3: Post-Login Cart Recovery

```
1. User was logged in previously
   - App.jsx loads
   - localStorage.getItem("token") finds saved token

2. StoreContext useEffect runs:
   - setToken(savedToken)
   - loadCartData(savedToken)
   - Backend returns: {pizza123: 2, burger456: 1}
   - setCartItems({pizza123: 2, burger456: 1})

3. User navigates to /cart
   - Sees their previous cart items
   - Cart was persisted across page reloads!
```

---

## 📊 DATA STRUCTURE REFERENCE

### cartItems Object
```javascript
{
  "pizza123": 2,        // Pizza: quantity 2
  "burger456": 1,       // Burger: quantity 1
  "biryani789": 0       // Biryani: quantity 0 (removed)
}

// How it's used:
cartItems["pizza123"]     // Returns: 2
cartItems["pizza123"] > 0 // Returns: true (show in cart)
cartItems["dosa"] || 0    // Returns: 0 (not in cart)
```

### food_list Array
```javascript
[
  {
    _id: "pizza123",
    name: "Pizza Margherita",
    description: "Classic pizza with fresh basil",
    price: 500,
    image: "pizza.jpg",
    category: "Fast Food"
  },
  {
    _id: "burger456",
    name: "Burger Deluxe",
    description: "Juicy burger with cheese",
    price: 300,
    image: "burger.jpg",
    category: "Fast Food"
  },
  // ... more foods
]

// How it's used in FoodDisplay:
food_list.map((item) => (
  <FoodItem 
    id={item._id}
    name={item.name}
    price={item.price}
    image={item.image}
  />
))
```

### Item in Cart Display
```javascript
// Calculation example:
item = {_id: "pizza123", name: "Pizza", price: 500, image: "pizza.jpg"}
cartItems["pizza123"] = 2

// In Cart table:
- Image: url + "/images/" + "pizza.jpg"
- Name: "Pizza Margherita"
- Price: ₹500 (single item)
- Quantity: 2 (cartItems[item._id])
- Total: ₹1000 (500 * 2)
```

---

## 🔗 FUNCTION REFERENCE

### useContext Extractions

```javascript
// In any component:
const {
    cartItems,        // Object: {itemId: quantity}
    food_list,        // Array: all foods
    addToCart,        // Function: addToCart(itemId)
    removeFromCart,   // Function: removeFromCart(itemId)
    getTotalCartAmount,// Function: getTotalCartAmount()
    url,              // String: backend URL
    token,            // String: auth token
    setToken          // Function: setToken(token)
} = useContext(StoreContext);
```

### Key Functions

```javascript
// ADD TO CART
addToCart(itemId)
// Updates: cartItems[itemId]++
// Syncs: Backend if logged in
// Triggers: Component re-render

// REMOVE FROM CART
removeFromCart(itemId)
// Updates: cartItems[itemId]--
// Syncs: Backend if logged in
// Triggers: Component re-render

// GET TOTAL AMOUNT
getTotalCartAmount()
// Returns: Number (sum of price × qty for all items)
// Used in: Cart total, order summary

// FETCH FOODS
fetchFoodList()
// Updates: setFoodList(response.data.data)
// Called: On app load via useEffect

// LOAD CART
loadCartData(token)
// Updates: setCartItems(response.data.cartData)
// Called: After login to restore cart
```

---

## 🔄 STATE UPDATE CYCLE

```
User Action
    ↓
Event Handler Called
    ↓
setState() executed in StoreContext
    ↓
Context value updates
    ↓
All components using useContext(StoreContext) re-render
    ↓
Component displays with NEW data
    ↓
If logged in: axios call to backend (async)
```

---

## 📝 COMMON PATTERNS

### Conditional Rendering

```javascript
// Show different UI based on login state
{!token ? 
    <button>Sign in</button>
: 
    <div>Profile Menu</div>
}

// Show items only if in cart
{cartItems[item._id] > 0 && (
    <div>Item in cart</div>
)}

// Show cart count
{getTotalCartAmount() === 0 ? 
    "Cart is empty"
: 
    `Total: ₹${getTotalCartAmount()}`
}
```

### .map() Pattern for Lists

```javascript
// Display all foods
food_list.map((item, index) => (
    <FoodItem 
        key={index}
        id={item._id}
        name={item.name}
        price={item.price}
        image={item.image}
    />
))

// Display only cart items
food_list.map((item) => {
    if(cartItems[item._id] > 0) {
        return <CartRow item={item} qty={cartItems[item._id]} />
    }
})
```

### Props Flow Pattern

```javascript
// Parent passes props
<Child prop1={value1} prop2={value2} />

// Child receives and uses
const Child = ({prop1, prop2}) => {
    return <div>{prop1} and {prop2}</div>
}

// Context for shared data
const {sharedData} = useContext(MyContext);
```

---

## 🚀 KEY TAKEAWAYS

1. **StoreContext is the Source of Truth**
   - All state data flows from here
   - All components tap into it via useContext()

2. **Props Flow Down, Actions Flow Up**
   - Parent passes data/functions as props
   - Child components call functions to update parent state

3. **useContext Replaces Prop Drilling**
   - No need to pass props through many levels
   - Components can directly access global state

4. **React Router for Navigation**
   - Link: For regular page navigation
   - useNavigate: For programmatic navigation after logic

5. **Conditional Rendering Controls UI**
   - Login state determines what shows
   - Cart items determine what displays

6. **Arrays & Objects for Data**
   - food_list: Array for displaying all foods
   - cartItems: Object for fast quantity lookup

7. **useEffect for Side Effects**
   - Fetch data on load
   - Restore cart from localStorage
   - Sync with backend

8. **Async/Await for API Calls**
   - addToCart sends request to backend
   - Login sends credentials to backend
   - Always sync important data with backend

---

## 📞 QUICK REFERENCE: WHERE THINGS HAPPEN

| Feature | Main Files | How to Find |
|---------|-----------|-------------|
| **Login** | App.jsx, Navbar.jsx, LoginPopup.jsx | Click "Sign in" in Navbar |
| **Add to Cart** | FoodItem.jsx, StoreContext.jsx | Click "Add" on food item |
| **View Cart** | Cart.jsx, StoreContext.jsx | Click cart icon in Navbar |
| **Checkout** | PlaceOrder.jsx | Click "Proceed to Checkout" in Cart |
| **Auth Token** | StoreContext.jsx, localStorage | Check browser DevTools |
| **Food List** | StoreContext.jsx, FoodDisplay.jsx | Homepage shows all foods |
| **Cart Items** | cartItems state, multiple pages | Check StoreContext |
| **Navigation** | App.jsx Routes, useNavigate | Click links in Navbar |

---

**Created**: January 22, 2026  
**Purpose**: Complete frontend flow documentation  
**Target**: Understanding Foodify frontend architecture
