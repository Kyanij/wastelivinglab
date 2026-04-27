import { useState, useCallback } from 'react';
import {
  doc,
  writeBatch,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { COLLECTIONS } from '../../firebase/collections';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useEntryMutations(studentId, refetch) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSuccess = useCallback(() => {
    if (refetch) refetch();
  }, [refetch]);

  const updateItem = useCallback(
    async (entry, updates) => {
      setLoading(true);
      try {
        const batch = writeBatch(db);

        const newAmount = parseFloat(updates.weight) * parseFloat(updates.rate);
        const weightDiff = updates.weight - entry.weight;
        const amountDiff = newAmount - entry.amount;

        batch.update(doc(db, COLLECTIONS.WASTE_ENTRIES, entry.id), {
          wasteTypeId: updates.wasteTypeId,
          wasteTypeName: updates.wasteTypeName,
          weight: parseFloat(updates.weight),
          rate: parseFloat(updates.rate),
          amount: newAmount,
        });

        batch.update(doc(db, COLLECTIONS.STUDENTS, studentId), {
          totalWaste: increment(weightDiff),
          totalEarnings: increment(amountDiff),
        });

        await batch.commit();
        toast.success(t('studentDetail.entryUpdated'));
        handleSuccess();
        return true;
      } catch (error) {
        toast.error(error.message || t('common.error'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [studentId, t, handleSuccess]
  );

  const updateDateEntries = useCallback(
    async (originalEntries, updatedRows, removedRows, addedRows, date) => {
      setLoading(true);
      try {
        const batch = writeBatch(db);

        let totalWeightDiff = 0;
        let totalAmountDiff = 0;

        for (const updatedEntry of updatedRows) {
          const old = originalEntries.find((e) => e.id === updatedEntry.id);
          totalWeightDiff += updatedEntry.weight - old.weight;
          totalAmountDiff += updatedEntry.amount - old.amount;
          batch.update(doc(db, COLLECTIONS.WASTE_ENTRIES, updatedEntry.id), {
            wasteTypeId: updatedEntry.wasteTypeId,
            wasteTypeName: updatedEntry.wasteTypeName,
            weight: updatedEntry.weight,
            rate: updatedEntry.rate,
            amount: updatedEntry.amount,
          });
        }

        for (const deletedEntry of removedRows) {
          totalWeightDiff -= deletedEntry.weight;
          totalAmountDiff -= deletedEntry.amount;
          batch.delete(doc(db, COLLECTIONS.WASTE_ENTRIES, deletedEntry.id));
        }

        for (const newEntry of addedRows) {
          const ref = doc(collection(db, COLLECTIONS.WASTE_ENTRIES));
          totalWeightDiff += newEntry.weight;
          totalAmountDiff += newEntry.amount;
          batch.set(ref, {
            ...newEntry,
            studentId,
            date,
            createdAt: serverTimestamp(),
          });
        }

        batch.update(doc(db, COLLECTIONS.STUDENTS, studentId), {
          totalWaste: increment(totalWeightDiff),
          totalEarnings: increment(totalAmountDiff),
          lastEntryDate: serverTimestamp(),
        });

        await batch.commit();
        toast.success(t('studentDetail.dateEntryUpdated'));
        handleSuccess();
        return true;
      } catch (error) {
        toast.error(error.message || t('common.error'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [studentId, t, handleSuccess]
  );

  const deleteItem = useCallback(
    async (entry) => {
      setLoading(true);
      try {
        const batch = writeBatch(db);

        batch.delete(doc(db, COLLECTIONS.WASTE_ENTRIES, entry.id));

        batch.update(doc(db, COLLECTIONS.STUDENTS, studentId), {
          totalWaste: increment(-entry.weight),
          totalEarnings: increment(-entry.amount),
        });

        await batch.commit();
        toast.success(t('studentDetail.itemDeleted'));
        handleSuccess();
        return true;
      } catch (error) {
        toast.error(error.message || t('common.error'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [studentId, t, handleSuccess]
  );

  const deleteDateEntries = useCallback(
    async (dateEntries) => {
      setLoading(true);
      try {
        const batch = writeBatch(db);

        let totalWeightRemoved = 0;
        let totalAmountRemoved = 0;

        for (const entry of dateEntries) {
          batch.delete(doc(db, COLLECTIONS.WASTE_ENTRIES, entry.id));
          totalWeightRemoved += entry.weight || 0;
          totalAmountRemoved += entry.amount || 0;
        }

        batch.update(doc(db, COLLECTIONS.STUDENTS, studentId), {
          totalWaste: increment(-totalWeightRemoved),
          totalEarnings: increment(-totalAmountRemoved),
          lastEntryDate: null,
        });

        await batch.commit();
        toast.success(t('studentDetail.itemDeleted'));
        handleSuccess();
        return true;
      } catch (error) {
        toast.error(error.message || t('common.error'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [studentId, t, handleSuccess]
  );

  return {
    loading,
    updateItem,
    updateDateEntries,
    deleteItem,
    deleteDateEntries,
  };
}