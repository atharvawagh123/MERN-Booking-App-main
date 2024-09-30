// App.js
import React from 'react';
import Navbar from './Navbar';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Place from './Place';
import PlaceDetail from './PlaceDetail';
import Booking from './Booking';


const App = () => {
  return (
   <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/place" element={<Place />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        <Route path="/bookings" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
