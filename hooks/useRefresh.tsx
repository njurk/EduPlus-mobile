import { Colors } from '@/constants/theme';
import React, { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

export function useRefresh(loadData: () => Promise<void>) {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const refreshControl = React.createElement(RefreshControl, {
        refreshing,
        onRefresh,
        colors: [Colors.primary.DEFAULT],
    });

    return { refreshing, onRefresh, refreshControl };
}
