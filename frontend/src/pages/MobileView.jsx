import React, { useEffect, useState } from 'react';
import MobileUpload from '../components/MobileUpload';
import './MobileView.css';

const MobileView = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if user is on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="mobile-view">
      {!isMobile && (
        <div className="desktop-warning">
          <p>⚠️ This view is optimized for mobile devices. For the shop dashboard, visit <a href="/global">/global</a></p>
        </div>
      )}
      <MobileUpload />
    </div>
  );
};

export default MobileView;