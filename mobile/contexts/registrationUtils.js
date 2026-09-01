// utils/registrationUtils.js
import { useUser } from './UserContext';

export const useRegistrationCheck = () => {
  const { currentUser } = useUser();

  const isUserRegistered = (event) => {
    if (!currentUser || !currentUser.id) {
      return false;
    }

    // Check if current user is registered for this event
    return event.registeredAlumni?.some(
      registration => registration.alumniId === currentUser.id
    ) || false;
  };

  const getRegistrationStatus = (event) => {
    if (!currentUser) {
      return { isRegistered: false, canRegister: false, message: 'Please login to register' };
    }

    const isRegistered = isUserRegistered(event);
    const hasCapacity = event.maxCapacity ? event.registeredCount < event.maxCapacity : true;
    const isEventActive = new Date(event.eventDate) > new Date();

    return {
      isRegistered,
      canRegister: !isRegistered && hasCapacity && isEventActive,
      message: isRegistered 
        ? 'You are registered for this event' 
        : !hasCapacity 
        ? 'Event is full' 
        : !isEventActive 
        ? 'Registration closed' 
        : 'Available for registration'
    };
  };

  return { isUserRegistered, getRegistrationStatus, currentUser };
};
