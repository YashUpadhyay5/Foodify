import React, { useContext } from 'react'
import './FoodDisplay.css';
// Import StoreContext - contains global food_list from backend
import { StoreContext } from '../../context/StoreContext';
// Import FoodItem component - will be rendered multiple times via .map()
import FoodItem from '../FoodItem/FoodItem';

// FoodDisplay Component - Displays list of all food items filtered by category
const FoodDisplay = ({category}) => {
        // Extract food_list from global StoreContext (fetched from backend in StoreContext)
        // food_list = [{_id: "1", name: "Pizza", price: 500, image: "pizza.jpg", category: "Fast Food"}, ...]
        const { food_list } = useContext(StoreContext) || {};
    return (
    <div className='food-display' id='food-display'>
        <h2>Top dishes near you</h2>
        <div className="food-display-list">
            {(() => {
                // SAFETY CHECK: Ensure food_list is an array before processing
                const items = Array.isArray(food_list) ? food_list : [];
                return items
                    // FILTER: Show only items matching selected category
                    .filter((item) => category === "All" || category === item.category)
                    
                    // MAP: Transform each food object into FoodItem component
                    // ============ ID FLOW STARTS HERE ============
                    // Each item from food_list has: {_id, name, price, image, category, ...}
                    .map((item) => (
                        <FoodItem
                            // key: React's internal identifier (not passed to component)
                            key={item._id}
                            
                            // ========== ID FLOW - STEP 1 ==========
                            // PASS id AS PROP to FoodItem
                            // item._id comes from: Backend database → StoreContext → food_list → map
                            // id will be used to track this specific item in cartItems
                            id={item._id}
                            
                            // Other props passed along with id
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                        />
                    ));
            })()}
        </div>
    </div>
  )
}

export default FoodDisplay

/* ========== COMPLETE ID FLOW EXPLANATION ==========

PATH: FoodDisplay → FoodItem → StoreContext → cartItems

STEP 1: ID SOURCE (in FoodDisplay)
  Backend Database
       ↓
  { _id: "pizza123", name: "Pizza", price: 500, ... }
       ↓
  Fetched by StoreContext.fetchFoodList() 
       ↓
  Stored in: food_list = [{_id: "pizza123", ...}, {_id: "burger456", ...}, ...]
       ↓
  FoodDisplay accesses via: useContext(StoreContext) → food_list

STEP 2: ID PASSED TO FOODITEM (in .map)  in the FoodDisplay component
  .map((item) => (
    <FoodItem 
      id={item._id}  ← PASSES pizza123 as prop
      name={item.name}
      price={item.price}
      ...
    />
  ))

STEP 3: FOODITEM RECEIVES ID AS PROP
  const FoodItem = ({id, name, price, ...}) => {
    // id = "pizza123" (received from parent FoodDisplay)
    const {cartItems, addToCart} = useContext(StoreContext);
    return (
      <img onClick={() => addToCart(id)} />
             ↑↑↑ Passes pizza123 here
    )
  }

STEP 4: ID SENT TO STORECONTEXT
  addToCart("pizza123") in StoreContext:
  
  const addToCart = async (itemId) => {  // itemId = "pizza123"
    if(!cartItems[itemId]){
      setCartItems((prev) => ({...prev, [itemId]: 1}))
      // Creates: cartItems["pizza123"] = 1
    } else {
      setCartItems((prev) => ({...prev, [itemId]: prev[itemId]+1}))
      // Updates: cartItems["pizza123"] = 2
    }
    
    if(token){
      await axios.post(url+"/api/cart/add", {itemId}, {headers: {token}})
      // Sends pizza123 to backend to save in database
    }
  }

RESULT: cartItems OBJECT ACCUMULATES IDS
  After multiple clicks:
  cartItems = {
    "pizza123": 2,      // User added Pizza 2 times
    "burger456": 1,     // User added Burger 1 time
    "biryani789": 3     // User added Biryani 3 times
  }

COMPLETE FLOW DIAGRAM:
  Backend DB
    ↓
  StoreContext.fetchFoodList() [gets all foods with _id]
    ↓
  food_list = [{_id: "pizza123", name: "Pizza", ...}, ...]
    ↓
  FoodDisplay.map((item) => <FoodItem id={item._id} />)
    ↓
  FoodItem receives id="pizza123" as prop
    ↓
  User clicks "Add" → onClick={() => addToCart("pizza123")}
    ↓
  StoreContext.addToCart("pizza123")
    ↓
  cartItems["pizza123"]++ 
    ↓
  Backend: axios.post("/api/cart/add", {itemId: "pizza123"})
    ↓
  Database saves pizza123 in user's cart

KEY POINTS:
- Each FoodItem has a UNIQUE id from database
- .map() creates multiple FoodItem components, each with different id
- id is passed through: FoodDisplay → FoodItem → addToCart function
- addToCart uses id as KEY in cartItems object
- Multiple ids accumulate in cartItems object with their quantities
- All backed by persistent database storage

================================================ */