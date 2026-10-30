import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { loadTrips, saveTrips } from "../services/tripStorage";
import { createTripId } from "../utils/tripUtils";

const TripContext = createContext(null);

function tripReducer(state, action) {
  switch (action.type) {
    case "ADD_TRIP":
      return [action.payload, ...state];

    case "UPDATE_TRIP":
      return state.map((trip) =>
        trip.id === action.payload.id
          ? { ...trip, ...action.payload }
          : trip,
      );

    case "DELETE_TRIP":
      return state.filter((trip) => trip.id !== action.payload);

    default:
      return state;
  }
}

export function TripProvider({ children }) {
  const [trips, dispatch] = useReducer(tripReducer, undefined, loadTrips);

  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  const addTrip = useCallback((tripData) => {
    const newTrip = {
      ...tripData,
      id: createTripId(),
      activityCount: 0,
      status: "Planning",
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "ADD_TRIP", payload: newTrip });
    return newTrip;
  }, []);

  const updateTrip = useCallback((tripData) => {
    dispatch({ type: "UPDATE_TRIP", payload: tripData });
  }, []);

  const deleteTrip = useCallback((tripId) => {
    dispatch({ type: "DELETE_TRIP", payload: tripId });
  }, []);

  const getTripById = useCallback(
    (tripId) => trips.find((trip) => trip.id === tripId),
    [trips],
  );

  const value = useMemo(
    () => ({ trips, addTrip, updateTrip, deleteTrip, getTripById }),
    [trips, addTrip, updateTrip, deleteTrip, getTripById],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrips() {
  const context = useContext(TripContext);

  if (!context) {
    throw new Error("useTrips must be used inside a TripProvider");
  }

  return context;
}
