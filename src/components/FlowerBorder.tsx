import React from 'react';

const FlowerBorder: React.FC = () => {
  return (
    <>
      {/* Animated Flower Border Corners */}
      <div className="flower-border-container">
        {/* Top Left Corner */}
        <div className="flower-corner top-left">
          <div className="flower-corner-inner">
            <img src="/bunga-hid.webp" alt="Flower Decoration" className="flower-img" />
          </div>
        </div>
        
        {/* Top Right Corner */}
        <div className="flower-corner top-right">
          <div className="flower-corner-inner">
            <img src="/bunga-hid.webp" alt="Flower Decoration" className="flower-img" />
          </div>
        </div>
        
        {/* Bottom Left Corner */}
        <div className="flower-corner bottom-left">
          <div className="flower-corner-inner">
            <img src="/bunga-hid.webp" alt="Flower Decoration" className="flower-img" />
          </div>
        </div>
        
        {/* Bottom Right Corner */}
        <div className="flower-corner bottom-right">
          <div className="flower-corner-inner">
            <img src="/bunga-hid.webp" alt="Flower Decoration" className="flower-img" />
          </div>
        </div>

        {/* Floating Petals Animation */}
        <div className="petals-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="petal"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default FlowerBorder;
