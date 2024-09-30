import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making HTTP requests
import './css/Navbar.css'; // Import the CSS for styling

const Navbar = () => {
    const navigate = useNavigate(); // Hook for programmatic navigation
    const email = localStorage.getItem('userEmail'); // Get email from local storage

    const handleLogout = async () => {
        try {
            // Send a POST request to logout
            await axios.post('http://localhost:4000/api/logout'); // Correct the URL format
            localStorage.removeItem('userEmail'); // Remove email from local storage
            navigate('/place'); // Redirect to the place page after logout
        } catch (error) {
            console.error('Logout failed:', error); // Log any error during logout
            // Optionally, you can show an error message to the user
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h2>My Booking</h2>
            </div>
            <div className="navbar-right">
                <Link to="/place" className="navbar-item">Places</Link>
                <Link to="/bookings" className="navbar-item">Booking</Link>
                {email ? (
                    <span
                        className="navbar-item logout-link"
                        onClick={handleLogout} // Handle logout on click
                    >
                        Logout
                    </span>
                ) : (
                    <Link to="/login" className="navbar-item">Sign Up</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
