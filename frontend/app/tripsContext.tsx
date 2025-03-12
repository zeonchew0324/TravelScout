import React, { createContext, useState, useContext } from 'react';

interface Trip {
  id: number;
  title: string;
  date: string;
  image: string;
}

interface TripContextType {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
}

// Create the context
const TripContext = createContext<TripContextType | undefined>(undefined);

// Create and export the provider component
export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([
    {
      id: 1,
      title: 'Malaysia Trip',
      date: 'Thu 12 January - Sun 15 January',
      image: 'https://via.placeholder.com/100',
    },
    {
      id: 2,
      title: 'Mars Trip',
      date: 'Thu 12 January - Sun 15 January',
      image: 'https://via.placeholder.com/100',
    },
  ]);

  // Function to add a trip
  const addTrip = (trip: Trip) => {
    setTrips((prevTrips) => [...prevTrips, trip]);
  };

  return (
    <TripContext.Provider value={{ trips, addTrip }}>
      {children}
    </TripContext.Provider>
  );
};

// Export the custom hook to use the context
export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};
