// lib/auth-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  preferences?: {
    darkMode: boolean;
    preferredTransportMode: string;
    language: string;
  };
  savedDestinations?: string[];
  savedItineraries?: any[];
}

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  saveDestination: (destinationId: string) => void;
  removeSavedDestination: (destinationId: string) => void;
  saveItinerary: (itinerary: any) => void;
  removeSavedItinerary: (itineraryId: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (name: string, email: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      preferences: {
        darkMode: false,
        preferredTransportMode: "car",
        language: "en"
      },
      savedDestinations: [],
      savedItineraries: []
    };
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;

    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    });
  };

  const saveDestination = (destinationId: string) => {
    if (!user) return;

    const updatedSavedDestinations = user.savedDestinations?.includes(destinationId)
      ? user.savedDestinations
      : [...(user.savedDestinations || []), destinationId];

    setUser({
      ...user,
      savedDestinations: updatedSavedDestinations
    });
  };

  const removeSavedDestination = (destinationId: string) => {
    if (!user || !user.savedDestinations) return;

    setUser({
      ...user,
      savedDestinations: user.savedDestinations.filter(id => id !== destinationId)
    });
  };

  const saveItinerary = (itinerary: any) => {
    if (!user) return;

    const updatedSavedItineraries = user.savedItineraries?.some(i => i.id === itinerary.id)
      ? user.savedItineraries.map(i => i.id === itinerary.id ? itinerary : i)
      : [...(user.savedItineraries || []), itinerary];

    setUser({
      ...user,
      savedItineraries: updatedSavedItineraries
    });
  };

  const removeSavedItinerary = (itineraryId: string) => {
    if (!user || !user.savedItineraries) return;

    setUser({
      ...user,
      savedItineraries: user.savedItineraries.filter(i => i.id !== itineraryId)
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updatePreferences,
        saveDestination,
        removeSavedDestination,
        saveItinerary,
        removeSavedItinerary,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
