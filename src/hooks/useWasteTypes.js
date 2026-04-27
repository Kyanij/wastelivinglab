import { useState, useEffect } from 'react';
import { getWasteTypes } from '../firebase/wasteTypes';

export const useWasteTypes = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getWasteTypes((types) => {
      setWasteTypes(types);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  return { wasteTypes, loading, error };
};