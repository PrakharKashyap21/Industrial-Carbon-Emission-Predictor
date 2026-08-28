import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPlants } from '../services/api';
import { useAuth } from './AuthContext';

const FilterContext = createContext(null);

export const FilterProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedPlantId, setSelectedPlantId] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [plants, setPlants] = useState([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPlantsData = async () => {
      setIsLoadingPlants(true);
      const res = await getPlants();
      if (isMounted) {
        if (res.success && Array.isArray(res.data)) {
          // If user has plant_id restriction, filter allowed plants
          let allowed = res.data;
          if (user?.plant_id) {
            allowed = res.data.filter((p) => p.id === user.plant_id);
            if (allowed.length > 0 && selectedPlantId === 'all') {
              setSelectedPlantId(allowed[0].id.toString());
            }
          }
          setPlants(allowed);
        } else {
          // Fallback static plant options if API endpoint is empty or offline
          setPlants([
            { id: 1, plant_name: 'Main Cement Plant', plant_code: 'PLANT-001' },
            { id: 2, plant_name: 'Steel Works Plant B', plant_code: 'PLANT-002' },
          ]);
        }
        setIsLoadingPlants(false);
      }
    };

    fetchPlantsData();
    return () => { isMounted = false; };
  }, [user]);

  const value = {
    selectedPlantId,
    setSelectedPlantId,
    dateRange,
    setDateRange,
    plants,
    isLoadingPlants,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export default FilterContext;
