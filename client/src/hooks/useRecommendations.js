import { useState, useEffect, useCallback, useRef } from 'react';
import { getRecommendations, invalidateRecommendations } from '../utils/api';

export function useRecommendations(userId, mealSlot) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const staleRef = useRef(null);

    const fetchData = useCallback(async () => {
        if (!userId || !mealSlot) return;

        // Show stale data immediately while refreshing (stale-while-revalidate)
        if (staleRef.current) {
            setData(staleRef.current);
            setLoading(false);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const result = await getRecommendations(userId, mealSlot);
            staleRef.current = result;
            setData(result);
        } catch (err) {
            setError(err.message);
            // Keep showing stale data on error
            if (!staleRef.current) {
                setData(null);
            }
        } finally {
            setLoading(false);
        }
    }, [userId, mealSlot]);

    useEffect(() => {
        // Invalidate cache when user or slot changes
        invalidateRecommendations();
        staleRef.current = null;
        setData(null);
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        invalidateRecommendations();
        return fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}
