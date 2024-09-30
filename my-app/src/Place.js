import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './css/Place.css';

const PlacesList = () => {
    const [places, setPlaces] = useState([]); // State to store places
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(''); // State to manage error messages
    const [addMessage, setAddMessage] = useState(''); // State to manage success message after adding

    // Fetch all places from the API
    const fetchPlaces = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/places');
            if (!response.ok) {
                throw new Error('Failed to fetch places. Please try again later.');
            }
            const data = await response.json();
            setPlaces(data); // Update state with fetched places
        } catch (error) {
            setError(`Error: ${error.message}`); // Update error state with context
        } finally {
            setLoading(false); // Set loading to false regardless of the outcome
        }
    };

    useEffect(() => {
        fetchPlaces(); // Call fetchPlaces when component mounts
    }, []);

    const handleAddPlace = async (placeId) => {
        try {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                throw new Error('User email not found in local storage');
            }

            // Prepare the request body with the email and place ID
            const requestBody = {
                email: userEmail,
                place: placeId, // Use the placeId directly here
            };

            const response = await fetch('http://localhost:4000/api/user-places/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to add place. Please try again later.');
            }

            const result = await response.json();
            setAddMessage('Place added successfully!'); // Update message on success
            setError(''); // Clear any previous errors
        } catch (error) {
            setError(`Error: ${error.message}`); // Update error state with context
        }
    };

    return (
        <div className="places-wrapper">
            <h2 className="places-title">Places</h2>
            {loading && <p>Loading places...</p>}
            {error && <p className="error-message">{error}</p>}
            {addMessage && <p className="success-message">{addMessage}</p>}
            <div className="places-grid">
                {places.map((place) => (
                    <div key={place._id} className="place-card-item">
                        {/* Display the added photos */}
                        {place.photos && (
                            <div className="place-card-photos">
                                <img
                                    src={place.photos} // Use place.photos to display the single photo URL
                                    alt={`Photo of ${place.title}`}
                                    className="place-photo"
                                />
                            </div>
                        )}

                        <h3 className="place-card-title">{place.title}</h3>
                        <p className="place-card-description">{place.description}</p>
                        <p className="place-card-location">Location: {place.address}</p>

                        
                        <div className="place-card-buttons">
                            <button
                                onClick={() => handleAddPlace(place._id)}
                                className="button-add"
                            >
                                Add
                            </button>
                            {/* Use Link to navigate to the place details page */}
                            <Link to={`/places/${place._id}`} className="button-info">
                                Get Information
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlacesList;
