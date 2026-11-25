import React, { useContext} from 'react'
import './FoodItem.css';
import { assets } from '../../assets/assets';
// Import StoreContext - contains all global state (cart, auth, food list)
import { StoreContext } from '../../context/StoreContext';

// FoodItem Component - Displays individual food card with add/remove buttons
// Receives props from FoodDisplay component via .map()
const FoodItem = ({id,name,price,description,image}) => {
    // PROPS received from parent (FoodDisplay):
    // - id: unique food item identifier (stored in cartItems object)
    // - name: food name to display
    // - price: food price
    // - description: food description
    // - image: food image filename

    // Extract functions & data from global StoreContext using useContext hook
    // This avoids prop drilling - directly access global state without passing through parents
    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);
    // 
    // cartItems: Object like {itemId: quantity} - tracks items in user's cart
    // addToCart: Function to add item to cart - addToCart(id)
    // removeFromCart: Function to remove item from cart - removeFromCart(id)
    // url: Backend API URL for fetching images

  return (
    <div className='food-item'>
        {/* Image Container Section */}
        <div className="food-item-img-container">
            {/* Display food image using backend URL + image filename */}
            <img className='food-item-image' src={url+"/images/"+image} alt="" />
            
            {/* CONDITIONAL RENDERING: Check if item is in cart */}
            {!cartItems[id]
                // If item NOT in cart (!cartItems[id] = true): Show ADD button
                ?<img 
                    className='add' 
                    // Arrow function captures id from props & passes to addToCart
                    // onClick={() => addToCart(id)} executes addToCart only on click
                    // This stores id in cartItems object: {itemId: 1}
                    onClick={()=>addToCart(id)} 
                    src={assets.add_icon_white} 
                    alt="" 
                  />
                // If item IS in cart (cartItems[id] > 0): Show COUNTER with +/- buttons
                :<div className='food-item-counter'>
                    {/* REMOVE button: Decreases quantity by 1 */}
                    {/* onClick={() => removeFromCart(id)} decreases: {itemId: 2 → 1} */}
                    <img 
                      onClick={()=>removeFromCart(id)} 
                      src={assets.remove_icon_red} 
                      alt="" 
                    />
                    
                    {/* Display current quantity in cart for this item */}
                    {/* cartItems[id] shows how many of this item user added */}
                    <p>{cartItems[id]}</p>
                    
                    {/* ADD button again: Increases quantity by 1 */}
                    {/* onClick={() => addToCart(id)} increases: {itemId: 1 → 2} */}
                    <img 
                      onClick={()=>addToCart(id)} 
                      src={assets.add_icon_green} 
                      alt='' 
                    />
                </div>
            }
        </div>

        {/* Food Information Section */}
        <div className="food-item-info">
            <div className="food-item-name-rating">
                {/* Display food name received from props */}
                <p>{name}</p>
                {/* Display rating image */}
                <img src={assets.rating_starts} alt="" />
            </div>
            
            {/* Display food description received from props */}
            <p className="food-item-desc">{description}</p>
            
            {/* Display food price received from props */}
            <p className="food-item-price">₹{price}</p>
        </div>
    </div>
  )
}

// Export component so FoodDisplay can import and use it
export default FoodItem

/* ========== KEY CONCEPTS SUMMARY ==========

1. PROPS vs CONTEXT:
   - Props (id, name, price, image): Data about THIS specific food item from parent
   - Context (addToCart, removeFromCart, cartItems): Global functions & state from StoreContext

2. HOW IDs FLOW:
   FoodDisplay → passes id as prop → FoodItem receives id → 
   onClick={() => addToCart(id)} → StoreContext.addToCart(id) → 
   cartItems[id] updated → cartItems = {pizza123: 1, burger456: 2, ...}

3. CONDITIONAL RENDERING:
   {!cartItems[id] ? <AddButton /> : <Counter />}
   - If id NOT in cartItems: show single ADD button
   - If id IS in cartItems: show +/- counter with quantity

4. EVENT HANDLERS:
   - onClick={()=>addToCart(id)}: Arrow function captures id, calls addToCart with it
   - onClick={()=>removeFromCart(id)}: Calls removeFromCart with this item's id

5. FLOW OF SINGLE CLICK:
   User clicks → onClick fires → Arrow function executes →
   addToCart(id) called in StoreContext → cartItems[id] updates →
   Component re-renders → UI shows counter instead of add button

6. MULTIPLE ITEMS EXAMPLE:
   If user adds: Pizza (id1), Burger (id2), Pizza again (id1)
   Result in cartItems: { id1: 2, id2: 1 }
   Each FoodItem independently calls addToCart with its own id
   
================================================ */