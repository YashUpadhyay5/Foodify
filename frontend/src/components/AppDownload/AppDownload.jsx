import React from 'react'
import './AppDownload.css';
import { assets } from '../../assets/assets';

const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
        <p>For Better Experience Download <br/>Tomato App</p>
        <div className="app-download-platforms">
            <img src={assets.play_store} alt="" />
            <img src={assets.app_store} alt="" />
        </div>
    </div>
  )
}

export default AppDownload



/*
  PAGE FILE

  - Represents a full screen / route of the application
  - Connected with React Router
  - Handles data fetching, state, and business logic
  - Sends data to components using props
  - Uses multiple reusable components
  - Not meant to be reused like components
  - use routing related hooks here (useNavigate, useParams, etc)
  -use the routes in which elements and routs like /home , /cart are defined

  Example: Home, Cart, Orders, Login
*/
/*
  COMPONENT FILE

  - Reusable UI building block
  - Used inside pages
  - Focuses mainly on UI / presentation
  - Receives data from pages using props
  - Does not handle routing
  - Can be reused in multiple pages

  Example: Navbar, FoodCard, Button, Footer
*/
