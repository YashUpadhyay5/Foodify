import React, { useContext, useState } from 'react'
import './Navbar.css';
import { assets } from '../../assets/assets';
// Link: For page navigation within the app (React Router)
// useNavigate: Hook to programmatically navigate to different pages
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

// Navbar Component - Main navigation bar for the app
// PROPS: setShowLogin - Function to open/close LoginPopup modal
// setShowLogin comes from parent App.jsx component
export const Navbar = ({setShowLogin}) => {
    // PROPS EXPLANATION:
    // setShowLogin: Function to control LoginPopup visibility
    //   - setShowLogin(true) → Opens login modal
    //   - setShowLogin(false) → Closes login modal
    // This prop is passed down from App.jsx → Navbar → Used here to trigger login
    
    // Track which menu item is currently active for highlighting
    const [menu,setMenu]=useState("menu");

    // Get cart total, authentication token, and logout function from global context
    const {getTotalCartAmount,token,setToken,setCartItems} = useContext(StoreContext);
    // token: Contains user's authentication token if logged in (empty string if not)
    // Determines whether to show "Sign in" button or profile menu
    
    // useNavigate hook to programmatically navigate to routes like '/cart', '/myorders', '/'
    const navigate=useNavigate();

    // Logout function: Removes token from localStorage and redirects to home
    const logout=()=>{
        localStorage.removeItem("token");  // Clear saved auth token
        setToken("");  // Clear token from global state
        if (setCartItems) {
            setCartItems({}); // Reset local cart state
        }
        navigate("/")  // Redirect to home page
    }

  return (

    <div className='navbar'>
        {/* ========== LOGO SECTION ==========
            Link to="/" : Navigates to home page when clicked
            React Router replaces page without full reload
        */}
        <Link to='/'><img src={assets.logo} alt='' className='logo'></img></Link>

        {/* ========== NAVIGATION MENU ==========
            Contains all main menu items
        */}
        <ul className="navbar-menu">
            {/* HOME LINK: Uses React Router Link for page navigation */}
            {/* to='/' : Routes to home page defined in App.jsx */}
            {/* onClick={()=>setMenu("home")} : Sets active menu state for highlighting */}
            {/* className={menu==="home" ? "active" : ""} : Adds "active" class to highlight current page */}
            <Link to='/' onClick={()=>setMenu("home")} className={menu==="home" ? "active" : ""}>Home</Link>

            {/* MENU LINK: Uses anchor tag (#) for smooth scroll within same page */}
            {/* href='#explore-menu' : Scrolls to element with id="explore-menu" */}
            {/* onClick={()=>setMenu("menu")} : Updates active menu state */}
            <a href='#explore-menu' onClick={()=>setMenu("menu")} className={menu==="menu" ?"active" : ""}>Menu</a>

            {/* MOBILE-APP LINK: Scrolls to mobile app section on same page */}
            {/* href='#app-download' : Smooth scroll to #app-download section */}
            <a href='#app-download' onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app" ?"active" : ""}>Mobile-app</a>

            {/* CONTACT US LINK: Scrolls to footer section for contact info */}
            {/* href='#footer' : Smooth scroll to #footer section */}
            <a href='#footer' onClick={()=>setMenu("contact-us")} className={menu==="contact-us" ?"active" : ""}>Contact us</a>
        </ul>

        {/* ========== RIGHT SECTION: SEARCH, CART, PROFILE ==========
            Contains cart, user authentication, and profile options
        */}
        <div className="navbar-right">
            <img src={assets.search_icon} alt="" />
            
            {/* CART ICON SECTION */}
            <div className="navbar-search-icon">
                {/* CART LINK: Uses React Router Link to navigate to /cart page */}
                {/* to='/cart' : Routes to Cart page component defined in App.jsx */}
                <Link to='/cart'><img src={assets.basket_icon} alt="" /></Link>
                
                {/* CART BADGE: Shows red dot if cart has items */}
                {/* getTotalCartAmount()===0 ? "" : "dot" */}
                {/* If total > 0, displays "dot" class (red notification circle) */}
                <div className={getTotalCartAmount()===0 ?"":"dot"}></div>
            </div>

            {/* ========== AUTHENTICATION SECTION ==========
                Conditional rendering based on login state (token)
                token comes from StoreContext (set when user logs in)
                
                If NO token (!token): Show Sign in button
                If token EXISTS: Show profile dropdown menu
            */}
            {!token?
                // ===== CASE 1: NOT LOGGED IN =====
                // Show "Sign in" button when user has no token
                // onClick={()=>setShowLogin(true)} TRIGGERS LoginPopup
                // setShowLogin: PROP from App.jsx that opens LoginPopup modal
                // This button opens the login modal for authentication
                <button onClick={()=>setShowLogin(true)}>Sign in</button>
            :
                // ===== CASE 2: LOGGED IN =====
                // Show profile dropdown menu when user has token
                <div className='navbar-profile'>
                <img src={assets.profile_icon} alt="" />
                <ul className="navbar-profile-dropdown">
                    {/* ORDERS LINK: Navigates to user's orders page */}
                    {/* onClick={()=>navigate('/myorders')} : Uses useNavigate hook */}
                    {/* navigate() = programmatic navigation (alternative to Link) */}
                    <li onClick={()=>navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                    <hr />
                    
                    {/* LOGOUT BUTTON: Calls logout function to clear token and redirect */}
                    {/* onClick={logout} : Removes token, clears state, navigates to home */}
                    <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                </ul>
            </div>}
        </div>
    </div>
  )
}

/* ========== LOGIN FLOW IN NAVBAR ==========

PROP SOURCE: App.jsx
↓
<Navbar setShowLogin={setShowLogin} />
↓
Navbar receives: setShowLogin function
↓
Used when user clicks "Sign in" button

SIGN IN BUTTON FLOW:
1. User clicks "Sign in" button
   ↓
2. onClick={()=>setShowLogin(true)} triggered
   ↓
3. setShowLogin(true) opens LoginPopup modal
   ↓
4. LoginPopup component appears (from App.jsx)
   ↓
5. User fills login form and submits
   ↓
6. LoginPopup backend validation successful
   ↓
7. setToken(response.data.token) saves token to global state
   ↓
8. localStorage.setItem("token") saves for persistence
   ↓
9. setShowLogin(false) closes LoginPopup
   ↓
10. token now exists in StoreContext
   ↓
11. Navbar re-renders
   ↓
12. !token condition becomes false
   ↓
13. "Sign in" button DISAPPEARS
   ↓
14. Profile dropdown menu APPEARS instead

LOGIN STATE TRACKING:
┌─────────────────┬──────────────────┬──────────────────┐
│ Condition       │ What Shows        │ Source           │
├─────────────────┼──────────────────┼──────────────────┤
│ !token === true │ "Sign in" button  │ Login not done   │
│ !token === false│ Profile dropdown  │ User logged in   │
└─────────────────┴──────────────────┴──────────────────┘

TOKEN LIFECYCLE:
Initial: token = "" (from StoreContext)
   ↓
User clicks "Sign in" → setShowLogin(true)
   ↓
LoginPopup opens
   ↓
User submits form
   ↓
Backend validates
   ↓
Success: token = "jwt_token_string"
   ↓
Saved to: StoreContext + localStorage
   ↓
setShowLogin(false) closes modal
   ↓
Navbar sees token exists
   ↓
Shows profile menu instead of sign in button

LOGOUT FLOW:
User clicks "Logout"
   ↓
logout() function called
   ↓
localStorage.removeItem("token")
   ↓
setToken("") clears global state
   ↓
navigate("/") redirects to home
   ↓
token = "" (empty)
   ↓
!token === true again
   ↓
"Sign in" button reappears

================================================ */

/* ========== LINKING METHODS USED IN NAVBAR ==========

1. REACT ROUTER LINK (for page navigation):
   - <Link to='/'> : Navigates to different routes/pages
   - No full page reload - SPA (Single Page Application)
   - Used for: Home page, Cart page
   - Routes defined in App.jsx

2. ANCHOR TAGS with href="#id" (for smooth scroll):
   - <a href='#explore-menu'> : Scrolls to element with id="explore-menu"
   - Stays on same page - just scrolls down
   - Used for: Menu, Mobile-app, Contact us sections
   - These elements must have matching id attributes

3. useNavigate HOOK (programmatic navigation):
   - const navigate = useNavigate()
   - navigate('/myorders') : Navigate to a route
   - navigate('/') : Navigate to home
   - More powerful than Link - can add logic before navigating
   - Used for: Orders page, Logout redirect

DIFFERENCE BETWEEN METHODS:
┌─────────────────┬──────────────────┬──────────────────┬─────────────────┐
│ Method          │ Usage            │ Navigation Type  │ Best For        │
├─────────────────┼──────────────────┼──────────────────┼─────────────────┤
│ <Link to='/'> │ Different pages  │ React Router     │ Simple links    │
│ <a href='#x'> │ Same page scroll │ Anchor scroll    │ In-page nav     │
│ navigate('/x')│ With logic       │ Programmatic     │ Conditional nav │
└─────────────────┴──────────────────┴──────────────────┴─────────────────┘

NAVBAR ROUTING EXAMPLES:
- Home Button: <Link to='/'> → Goes to home page
- Menu Link: <a href='#explore-menu'> → Scrolls down on same page
- Cart Icon: <Link to='/cart'> → Goes to cart page
- Orders: navigate('/myorders') → Goes to orders page after logic
- Logout: navigate('/') after clearing token → Goes to home logged out

=============================================== */
