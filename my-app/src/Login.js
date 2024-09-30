import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { Link } from 'react-router-dom'; // Import Link for navigation
import './css/./Login.css'; // Import your CSS file for styling

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // Hook for programmatic navigation

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission

        try {
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successfully logged in
                console.log('Login successful', data);

                // Store the email in local storage
                localStorage.setItem('userEmail', email);

                // Optionally, you can store the token or user info in local storage or context
                // localStorage.setItem('token', data.token); // Store token if needed

                // Redirect to another page (e.g., places page)
                navigate('/place'); // Redirect to the place page after login
            } else {
                // Handle errors returned from the server
                setErrorMessage(data.error);
                if (data.error === 'User not found') {
                    // Redirect to register page if user not found
                    navigate('/register');
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-login">Login</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;
