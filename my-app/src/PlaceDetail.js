import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/PlaceDetail.css';

const PlaceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [suggestedPlaces, setSuggestedPlaces] = useState([]);
    const [addMessage, setAddMessage] = useState('');

    // Get user email from localStorage
    const userEmail = localStorage.getItem('userEmail');

    const fetchPlaceById = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/places/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch place details');
            }
            const data = await response.json();
            setPlace(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestedPlaces = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/places');
            const data = await response.json();
            setSuggestedPlaces(data.filter((p) => p._id !== id).slice(0, 3)); // Show 3 places
        } catch (error) {
            console.error('Failed to fetch suggested places:', error);
        }
    };

    const handleAddPlace = async () => {
        if (!userEmail) {
            setError('User email not found in local storage.');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/user-places/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail, place: id }),
            });

            if (!response.ok) {
                throw new Error('Failed to add place');
            }

            const updatedPlaces = await response.json();
            setAddMessage('Place added successfully!');
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchPlaceById();
        fetchSuggestedPlaces();
    }, [id]);

    if (loading) return <p className="pd-loading">Loading place details...</p>;
    if (error) return <p className="pd-error">{error}</p>;
    if (!place) return <p className="pd-not-found">No place found.</p>;

    return (
        <div className="pd-container">
            <button onClick={() => navigate('/place')} className="pd-back-btn">
                Back to Places
            </button>

            <div className="pd-content">
                <div className="pd-photo-container">
                    {place.photos ? (
                        <img
                            src={place.photos}
                            alt={`Photo of ${place.name}`}
                            className="pd-photo"
                        />
                    ) : (
                        <p className="pd-no-photo">No photos available.</p>
                    )}
                </div>

                <div className="pd-info">
                    <h2 className="pd-title">{place.name}</h2>
                    <p className="pd-description">{place.description}</p>
                    <p className="pd-location">Location: {place.address}</p>
                    <p className="pd-perks">Perks: {place.perks?.join(', ')}</p>
                    <p className="pd-extra-info">Extra Info: {place.extraInfo}</p>
                    <p className="pd-checkin-checkout">
                        Check-In: {place.checkIn} | Check-Out: {place.checkOut}
                    </p>
                    <p className="pd-max-guests">Max Guests: {place.maxGuests}</p>
                    <p className="pd-price">Price: ${place.price}</p>

                    <button onClick={handleAddPlace} className="pd-add-btn">
                        Add to My Places
                    </button>
                    {addMessage && <p className="pd-success">{addMessage}</p>}
                </div>
            </div>

            <div className="pd-suggested">
                <h3 className="pd-suggested-title">Suggested Places</h3>
                <div className="pd-suggested-grid">
                    {suggestedPlaces.map((suggestedPlace) => (
                        <div key={suggestedPlace._id} className="pd-suggested-card">
                            <img
                                src={suggestedPlace.photos || ''}
                                alt={`Photo of ${suggestedPlace.name}`}
                                className="pd-suggested-photo"
                            />
                            <h4 className="pd-suggested-name">{suggestedPlace.name}</h4>
                            <p className="pd-suggested-description">{suggestedPlace.description}</p>
                            <button
                                onClick={() => navigate(`/places/${suggestedPlace._id}`)}
                                className="pd-suggested-btn"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlaceDetail;
