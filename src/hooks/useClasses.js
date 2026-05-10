import { useState, useEffect, useCallback } from 'react';
import {
  getClasses,
  getAllClasses,
  getClassById,
  addClass,
  updateClass,
  deleteClass,
  getClassesCount,
  getClassesTotalStats,
  getEntriesByClassId,
  addClassWasteEntry,
  updateClassWasteEntry,
  deleteClassWasteEntry,
  deleteClassWasteEntriesByDate,
  updateClassEntriesByDate,
} from '../firebase/classes';

export function useClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const { classes } = await getClasses();
      setClasses(classes);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const add = async (data) => {
    const id = await addClass(data);
    await fetchClasses();
    return id;
  };

  const update = async (id, data) => {
    await updateClass(id, data);
    await fetchClasses();
  };

  const remove = async (id) => {
    await deleteClass(id);
    await fetchClasses();
  };

  return {
    classes,
    loading,
    error,
    refetch: fetchClasses,
    addClass: add,
    updateClass: update,
    deleteClass: remove,
  };
}

export function useClassDetail(classId) {
  const [classData, setClassData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const [classResult, entriesResult] = await Promise.all([
        getClassById(classId),
        getEntriesByClassId(classId),
      ]);
      setClassData(classResult);
      setEntries(entriesResult);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    classData,
    entries,
    loading,
    error,
    refetch: fetchData,
  };
}

export function useClassMutations(classId, refetch) {
  const [loading, setLoading] = useState(false);

  const addEntry = async (data) => {
    setLoading(true);
    try {
      await addClassWasteEntry(data);
      if (refetch) await refetch();
      return true;
    } catch (err) {
      console.error('Error adding class entry:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (entryId, oldData, newData) => {
    setLoading(true);
    try {
      await updateClassWasteEntry(entryId, oldData, newData);
      if (refetch) await refetch();
      return true;
    } catch (err) {
      console.error('Error updating class entry:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entry) => {
    setLoading(true);
    try {
      await deleteClassWasteEntry(entry);
      if (refetch) await refetch();
      return true;
    } catch (err) {
      console.error('Error deleting class entry:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntriesByDate = async (entries) => {
    setLoading(true);
    try {
      await deleteClassWasteEntriesByDate(classId, entries);
      if (refetch) await refetch();
      return true;
    } catch (err) {
      console.error('Error deleting class entries by date:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDateEntries = async (originalEntries, updatedRows, removedRows, addedRows, date) => {
    setLoading(true);
    try {
      await updateClassEntriesByDate(classId, originalEntries, updatedRows, removedRows, addedRows, date);
      if (refetch) await refetch();
      return true;
    } catch (err) {
      console.error('Error updating date entries:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    deleteEntriesByDate,
    updateDateEntries,
  };
}

export function useClassesStats() {
  const [stats, setStats] = useState({ totalClasses: 0, totalWaste: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getClassesTotalStats();
        setStats(result);
      } catch (err) {
        console.error('Error fetching class stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, loading };
}