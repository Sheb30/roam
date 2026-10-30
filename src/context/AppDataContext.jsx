/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { demoTrips } from "../data/destinations";
import { loadAppData, saveAppData } from "../services/storage";

const AppDataContext = createContext(null);
const initialStoredData = loadAppData();
const initialState = initialStoredData || { trips: demoTrips, savedPlaces: [] };

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TRIP":
      return { ...state, trips: [action.payload, ...state.trips] };
    case "UPDATE_TRIP":
      return { ...state, trips: state.trips.map((trip) => trip.id === action.payload.id ? { ...trip, ...action.payload } : trip) };
    case "DELETE_TRIP":
      return { ...state, trips: state.trips.filter((trip) => trip.id !== action.payload) };
    case "TOGGLE_SAVED": {
      const exists = state.savedPlaces.some((place) => place.id === action.payload.id);
      return { ...state, savedPlaces: exists ? state.savedPlaces.filter((place) => place.id !== action.payload.id) : [action.payload, ...state.savedPlaces] };
    }
    case "REMOVE_SAVED":
      return { ...state, savedPlaces: state.savedPlaces.filter((place) => place.id !== action.payload) };
    case "CLEAR_SAVED":
      return { ...state, savedPlaces: [] };
    default:
      return state;
  }
}

export function AppDataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => { saveAppData(state); }, [state]);

  const addTrip = useCallback((data) => {
    const trip = { ...data, id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, activities: [], expenses: [], createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_TRIP", payload: trip });
    return trip;
  }, []);
  const updateTrip = useCallback((data) => dispatch({ type: "UPDATE_TRIP", payload: data }), []);
  const deleteTrip = useCallback((id) => dispatch({ type: "DELETE_TRIP", payload: id }), []);
  const toggleSaved = useCallback((place) => dispatch({ type: "TOGGLE_SAVED", payload: place }), []);
  const removeSaved = useCallback((id) => dispatch({ type: "REMOVE_SAVED", payload: id }), []);
  const clearSaved = useCallback(() => dispatch({ type: "CLEAR_SAVED" }), []);
  const isSaved = useCallback((id) => state.savedPlaces.some((place) => place.id === id), [state.savedPlaces]);

  const value = useMemo(() => ({ ...state, addTrip, updateTrip, deleteTrip, toggleSaved, removeSaved, clearSaved, isSaved }), [state, addTrip, updateTrip, deleteTrip, toggleSaved, removeSaved, clearSaved, isSaved]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used inside AppDataProvider");
  return context;
}
