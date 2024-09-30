import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdDelete } from "react-icons/md";

const Booking = () => {
    const email = localStorage.getItem('userEmail'); // Get email from local storage
    const [places, setPlaces] = useState([]); // Places added by the user
    const [error, setError] = useState(''); // To handle error messages

    // Load places from the server
    const loadPlaces = async () => {
        if (email) {
            try {
                const response = await axios.post('http://localhost:4000/api/user-places', { email });
                setPlaces(response.data); // Set places from the server response
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load places');
            }
        } else {
            setPlaces([]); // Clear places if email is not set
        }
    };

    // Function to delete a place by index
    const deletePlace = async (index) => {
        try {
            await axios.delete('http://localhost:4000/api/user-places', {
                data: { email, index } // Send email and index for deletion
            });
            // Update local state after deletion
            setPlaces((prevPlaces) => prevPlaces.filter((_, i) => i !== index));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete place');
        }
    };

    // Load places when the component mounts
    useEffect(() => {
        loadPlaces();
    }, [email]);

    return (
        <div>
            <h2>Your Booked Places</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {places.length === 0 ? (
                <p>No places booked.</p>
            ) : (
                <ul>
                    {places.map((place, index) => (
                        <li key={index}>
                            <h3>{place.name || `Place ${index + 1}`}</h3> {/* Show place name */}
                            <p>{place.description || 'No description available.'}</p> {/* Optional description */}
                            <button onClick={() => deletePlace(index)}><MdDelete /></button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Booking;
