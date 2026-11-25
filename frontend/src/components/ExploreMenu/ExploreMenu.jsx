// Import React library (needed to create React components)
import React from 'react'

// Import CSS file for styling this component
import './ExploreMenu.css'

// Import menu_list array from assets
// menu_list contains food categories like Pizza, Burger, etc.
// Each item has: menu_name, menu_image
import { menu_list } from '../../assets/assets'

// ExploreMenu component
// Props received from parent component (App.jsx usually):
// category → current selected category (state value)
// setCategory → function to update category state
const ExploreMenu = ({ category, setCategory }) => {

  // JSX returned by this component
  return (
    // Main container div
    // className → used for CSS styling
    // id → used for scrolling or navigation
    <div className='explore-menu' id='explore-menu'>
        
        {/* Heading of the section */}
        <h1>Explore Our Menu</h1>

        {/* Container that will hold all menu category items */}
        <div className="explore-menu-list">

            {/* 
              menu_list.map() loops through each menu item
              item → current object from menu_list
              index → index of the item (used as key)
            */}
            {menu_list.map((item, index) => {

                // Return JSX for each menu item
                return (
                    // Wrapper div for a single menu category
                    <div
                        key={index} // React needs a unique key for each list item
                        
                        // onClick logic:
                        // If clicked category is already selected → reset to "All"
                        // Otherwise → set clicked category
                        onClick={() =>
                          setCategory(
                            prev =>
                              prev === item.menu_name
                                ? "All"            // deselect if already selected
                                : item.menu_name   // select new category
                          )
                        }

                        className='explore-menu-list-item'
                    >

                        {/* Category image */}
                        <img
                            // If current category matches this item
                            // add "active" class for highlight styling
                            className={category === item.menu_name ? "active" : ""}
                            
                            // Image source from assets
                            src={item.menu_image}
                            
                            alt="" // alt text (can be improved for accessibility)
                        />

                        {/* Category name shown below image */}
                        <p>{item.menu_name}</p>

                    </div>
                )
            })}
        </div>

        {/* Horizontal line at the bottom */}
        <hr />
    </div>
  )
}

// Export component so it can be used in other files
export default ExploreMenu
