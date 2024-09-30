import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { Link } from 'react-router-dom'; // Import Link for navigation
import './css/Register.css'; // Import your CSS file for styling

const Register = () => {
    const [fullName, setFullName] = useState(''); // Updated state name
    const [emailAddress, setEmailAddress] = useState(''); // Updated state name
    const [userPassword, setUserPassword] = useState(''); // Updated state name
    const [registrationError, setRegistrationError] = useState(''); // Updated state name
    const navigate = useNavigate(); // Hook for programmatic navigation

    const handleRegistration = async (e) => {
        e.preventDefault(); // Prevent default form submission

        try {
            const response = await fetch('http://localhost:4000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: fullName, email: emailAddress, password: userPassword }), // Updated body
            });

            const data = await response.json();

            if (response.ok) {
                // Successfully registered, redirect to login
                console.log('Registration successful', data);
                navigate('/place'); // Redirect to the dashboard or homepage
            } else {
                // Handle errors returned from the server
                setRegistrationError(data.error);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setRegistrationError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="registration-container">
            <h2 className="registration-title">Create Account</h2>
            <form className="registration-form" onSubmit={handleRegistration}>
                <div className="input-group">
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="emailAddress">Email:</label>
                    <input
                        id="emailAddress"
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="userPassword">Password:</label>
                    <input
                        id="userPassword"
                        type="password"
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="register-button">Register</button>
                {registrationError && <p className="error-message">{registrationError}</p>}
            </form>
            <p className="login-prompt">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;
