import { GlobalStyles } from '@/constants/styles';
import { Colors, Spacing } from '@/constants/theme';
import React, { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface Props {
    loading: boolean;
    empty: boolean;
    emptyText?: string;
    children: ReactNode;
}

export default function ListState({ loading, empty, emptyText = 'Brak', children }: Props) {
    if (loading) {
        return (
            <View style={[GlobalStyles.emptyContainer, { paddingTop: Spacing[8] }]}>
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
        );
    }

    if (empty) {
        return (
            <View style={GlobalStyles.emptyContainer}>
                <Text style={GlobalStyles.emptyText}>{emptyText}</Text>
            </View>
        );
    }

    return <>{children}</>;
}
