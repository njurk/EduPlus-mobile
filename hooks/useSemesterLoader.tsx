import { Colors } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

export function useSemesterLoader(loadFn: (semesterId: number) => Promise<void>) {
    const { selectedStudent } = useStudent();
    const [currentSemesterId, setCurrentSemesterId] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (currentSemesterId) loadFn(currentSemesterId);
        }, [selectedStudent, currentSemesterId])
    );

    const onSemesterChange = (id: number) => {
        setCurrentSemesterId(id);
        loadFn(id);
    };

    const onRefresh = async () => {
        if (!currentSemesterId) return;
        setRefreshing(true);
        await loadFn(currentSemesterId);
        setRefreshing(false);
    };

    const refreshControl = (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />
    );

    return { currentSemesterId, onSemesterChange, refreshing, refreshControl };
}
