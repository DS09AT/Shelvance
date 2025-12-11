import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useNavigationBlocker(shouldBlock) {
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [pendingLocation, setPendingLocation] = React.useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = React.useRef(location);

  React.useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Handle browser beforeunload event
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    if (shouldBlock) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [shouldBlock]);

  const blocker = {
    state: isBlocked ? 'blocked' : 'unblocked',
    location: pendingLocation,
    proceed: () => {
      if (pendingLocation) {
        setIsBlocked(false);
        navigate(pendingLocation.pathname + pendingLocation.search, { replace: true });
        setPendingLocation(null);
      }
    },
    reset: () => {
      setIsBlocked(false);
      setPendingLocation(null);
    }
  };

  return blocker;
}
