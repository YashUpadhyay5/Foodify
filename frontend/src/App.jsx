import React, { useState } from 'react'
import { Navbar } from './components/Navbar/Navbar'
import {  Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'

// ========== APP.JSX - ROOT COMPONENT ==========
// This is the main component that manages global state for login modal
// All other components (Navbar, LoginPopup, etc.) are rendered here

const App = () => {
    // ========== STATE CREATION ==========
    // Line 13: Create state to control LoginPopup visibility
    // showLogin: boolean - true = modal visible, false = modal hidden
    // setShowLogin: function - used to update showLogin state
    // Initial value: false (LoginPopup is HIDDEN when app starts)
    const [showLogin,setShowLogin]=useState(false);
    
    // ========== HOW THIS STATE IS USED ==========
    // 1. Controls whether LoginPopup renders or not (Line 17)
    // 2. Passed to Navbar as prop (Line 19)
    // 3. Navbar calls setShowLogin(true) when "Sign in" button clicked
    // 4. When state changes → App re-renders → LoginPopup appears/disappears

  return (
    <>
      {/* ========== LINE 17: CONDITIONAL RENDERING OF LoginPopup ==========
          If showLogin === true: Render <LoginPopup setShowLogin={setShowLogin}/>
          If showLogin === false: Render empty fragment <></> (nothing)
          
          Syntax: {condition ? trueComponent : falseComponent}
          
          WHY THIS WORKS:
          - showLogin state is managed here in App.jsx (centralized)
          - setShowLogin function is passed to LoginPopup
          - When user clicks "Sign in" in Navbar → setShowLogin(true)
          - App re-renders → showLogin becomes true → LoginPopup renders
          - When user closes modal → setShowLogin(false) → LoginPopup disappears
      */}
      {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      
  <div className='app'>
      {/* ========== LINE 19: PASS PROPS TO NAVBAR ==========
          <Navbar setShowLogin={setShowLogin}/>
          
          What's being passed:
          - setShowLogin: The state setter function from line 13
          
          What Navbar does with it:
          - Receives it as prop: export const Navbar = ({setShowLogin}) => {
          - Uses it in "Sign in" button: onClick={() => setShowLogin(true)}
          - When clicked → setShowLogin(true) → App state updates → LoginPopup appears
      */}
      <Navbar setShowLogin={setShowLogin}/>
      
      {/* Routes for different pages */}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/cart' element={<Cart setShowLogin={setShowLogin}/>}/>
        <Route path='/order' element={<PlaceOrder setShowLogin={setShowLogin}/>}/>
        <Route path='/verify' element={<Verify/>}/>
        <Route path='/myorders' element={<MyOrders/>}/>
      </Routes>
  </div>
  <Footer/>

    </>
  )
}

export default App

/* ========== DEEP UNDERSTANDING: STATE FLOW IN APP.JSX ==========

OVERVIEW:
App.jsx is the ROOT component that manages the login modal state.
It passes setShowLogin to BOTH Navbar and LoginPopup (conditional render).

┌─────────────────────────────────────────────────────────────────┐
│                         App.jsx                                 │
│                                                                 │
│  const [showLogin, setShowLogin] = useState(false)             │
│          ↓state                      ↓function                 │
│                                                                 │
│  Passes to: Navbar + LoginPopup                                │
└─────────────────────────────────────────────────────────────────┘

STEP-BY-STEP FLOW:

INITIAL STATE:
showLogin = false
LoginPopup does NOT render (shows <></>)
"Sign in" button visible in Navbar

USER CLICKS "SIGN IN" BUTTON:
Navbar "Sign in" button → onClick={() => setShowLogin(true)}
           ↓
  setShowLogin(true) executes
           ↓
  App.jsx state updates: showLogin = true
           ↓
  App.jsx re-renders
           ↓
  {showLogin?<LoginPopup/>:<></>} evaluates to <LoginPopup/>
           ↓
  LoginPopup component MOUNTS and becomes visible

USER FILLS FORM AND SUBMITS:
LoginPopup receives setShowLogin as prop
User enters email/password
Clicks "Login" button
           ↓
onLogin function sends axios.post to backend
           ↓
Backend validates credentials
           ↓
If success: setShowLogin(false) is called
           ↓
App.jsx state updates: showLogin = false
           ↓
App.jsx re-renders
           ↓
{showLogin?<LoginPopup/>:<></>} evaluates to <></>
           ↓
LoginPopup UNMOUNTS (disappears)

USER CLICKS CLOSE (X) BUTTON:
LoginPopup receives setShowLogin as prop
User clicks X icon
           ↓
onClick={() => setShowLogin(false)}
           ↓
setShowLogin(false) executes
           ↓
App.jsx state updates: showLogin = false
           ↓
LoginPopup disappears

COMPONENT HIERARCHY:
┌─────────────────────────────────────────┐
│           App.jsx (Parent)              │
│  [showLogin state is managed here]      │
│                                         │
│  ├─ LoginPopup (Conditional)            │
│  │  └─ Receives: setShowLogin prop      │
│  │     Uses: setShowLogin(false) to close│
│  │                                      │
│  ├─ Navbar                              │
│  │  └─ Receives: setShowLogin prop      │
│  │     Uses: setShowLogin(true) to open │
│  │                                      │
│  ├─ Routes                              │
│  │  ├─ Home                             │
│  │  ├─ Cart                             │
│  │  ├─ PlaceOrder                       │
│  │  ├─ Verify                           │
│  │  └─ MyOrders                         │
│  │                                      │
│  └─ Footer                              │
└─────────────────────────────────────────┘

WHY THIS PATTERN IS GOOD:

1. CENTRALIZED STATE:
   - showLogin state lives in App.jsx
   - Single source of truth
   - Easy to track modal state from one place

2. CONTROLLED COMPONENT:
   - Parent (App) controls when LoginPopup renders
   - Not LoginPopup controlling itself
   - More predictable behavior

3. UNIDIRECTIONAL DATA FLOW:
   - App passes setShowLogin DOWN to children
   - Children call setShowLogin UP to parent
   - Clear data flow direction

4. REUSABLE:
   - Multiple components can trigger same modal
   - Navbar, Footer, other components can all open LoginPopup
   - Just pass setShowLogin to them

STATE UPDATES:
┌─────────────────────────────────────────┐
│ Who calls setShowLogin(true)?            │
├─────────────────────────────────────────┤
│ 1. Navbar - "Sign in" button clicked     │
│ 2. Navbar - "Sign in" link clicked       │
│ 3. Any other component that needs login  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Who calls setShowLogin(false)?           │
├─────────────────────────────────────────┤
│ 1. LoginPopup - X (close) button         │
│ 2. LoginPopup - Successful login         │
│ 3. LoginPopup - User clicks outside      │
└─────────────────────────────────────────┘

KEY CONCEPT: CONDITIONAL RENDERING
{showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
     ↑      ↑                                          ↑
  condition  if true                               if false

This means:
- When showLogin=true → Component renders with full JSX
- When showLogin=false → Empty fragment renders (nothing visible)
- Very efficient - component unmounts/mounts on toggle

IMPORTANT NOTES:

1. setShowLogin is passed to BOTH Navbar and LoginPopup
   - They don't communicate with each other
   - Both communicate through parent (App.jsx)

2. Only App.jsx knows the showLogin state
   - Navbar doesn't know if LoginPopup is open
   - LoginPopup doesn't know about Navbar
   - They are siblings, not parent-child

3. Props flow DOWN, events flow UP
   - App passes setShowLogin DOWN as prop
   - Navbar/LoginPopup call setShowLogin UP to parent
   - This is React's one-way data flow pattern

4. Re-rendering:
   - When setShowLogin is called
   - App.jsx re-renders
   - All children re-render with new state value
   - LoginPopup appears/disappears based on condition

================================================ */