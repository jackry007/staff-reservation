import React from "react";

const LoadingScreen = ({ text = "Loading reservations..." }) => {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <div className="loading-clock">
          <div className="loading-ring"></div>
          <div className="loading-logo">H</div>
        </div>

        <h1 className="loading-title">Hiro Reservation</h1>
        <p className="loading-text">{text}</p>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
