import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import FreightFoxLottie from '../../assets/lottie/FreightFox.json';

/**
 * LoadingScreen component that displays a Lottie animation
 * Can be used during transitions between pages or while data is loading
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the loading screen
 * @param {number} props.minDisplayTime - Minimum time in ms to display the loader (prevents flashes)
 * @param {Function} props.onComplete - Callback function when loading is complete
 */
const LoadingScreen = ({ show = true, minDisplayTime = 2000, onComplete }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    let timer;
    
    if (show) {
      setIsVisible(true);
    } else {
      // If hide is requested, wait for minDisplayTime before hiding
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, minDisplayTime);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="w-auto h-auto">
          <Lottie
            animationData={FreightFoxLottie}
            loop={true}
            autoplay={true}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
