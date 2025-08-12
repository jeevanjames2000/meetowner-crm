import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { setStates } from '../store/slices/propertyDetails';
import ngrokAxiosInstance from './AxiosInstance';

interface City {
  value: number;
  label: string;
}

interface State {
  value: number;
  label: string;
}

interface CitiesResponse {
  status: 'success' | 'error';
  message: string;
  cities: City[];
}

interface StatesResponse {
  status: 'success' | 'error';
  message: string;
  states: State[];
}

interface ErrorResponse {
  message?: string;
}

export const usePropertyQueries = () => {
  const dispatch = useDispatch();

  // States Query
  const statesQuery = useQuery<State[], AxiosError<ErrorResponse>>({
    queryKey: ['states'],
    queryFn: async () => {
      const response = await ngrokAxiosInstance.get<StatesResponse>('/api/v1/states');
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to fetch states');
      }
      return response.data.states;
    },
    staleTime: 2 * 24 * 60 * 60 * 1000, // 2 days
  });

  // Cities Query (requires stateId)
  const citiesQuery = (stateId?: number) =>
    useQuery<City[], AxiosError<ErrorResponse>>({
      queryKey: ['cities', stateId],
      queryFn: async () => {
        if (!stateId) {
          throw new Error('stateId is required');
        }
        const response = await ngrokAxiosInstance.get<CitiesResponse>(`/api/v1/city/${stateId}`);
        if (response.data.status !== 'success') {
          throw new Error(response.data.message || 'Failed to fetch cities');
        }
        return response.data.cities;
      },
      staleTime: 2 * 24 * 60 * 60 * 1000, // 2 days
      enabled: !!stateId, // Only fetch when stateId is provided
    });

  // Dispatch states to Redux
  useEffect(() => {
    if (statesQuery.data) {
      dispatch(setStates(statesQuery.data));
    }
  }, [statesQuery.data, dispatch]);

  return {
    statesQuery,
    citiesQuery,
  };
};