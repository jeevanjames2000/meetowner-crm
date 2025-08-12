import { createSlice } from '@reduxjs/toolkit';

interface City {
  value: number;
  label: string;
}

interface State {
  value: number;
  label: string;
}

interface PropertyState {
  propertyDetails: any[];
  cities: City[];
  states: State[];
}

const initialState: PropertyState = {
  propertyDetails: [],
  cities: [],
  states: [],
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setPropertyDetails: (state, action) => {
      state.propertyDetails = action.payload;
    },
    setCityDetails: (state, action) => {
      state.cities = action.payload;
    },
    setStates: (state, action) => {
      state.states = action.payload;
    },
  },
});

export const { setPropertyDetails, setCityDetails, setStates } = propertySlice.actions;
export default propertySlice.reducer;