import { Colors, FontSizes, Spacing } from '@/constants/theme';
import React from 'react';
import { Text, View } from 'react-native';

interface Props {
    label: string;
    color: string;
}

export default function StatusBadge({ label, color }: Props) {
    return (
        <View style={{ backgroundColor: color, paddingHorizontal: Spacing[2], paddingVertical: Spacing[1], borderRadius: 4 }}>
            <Text style={{ color: '#fff', fontSize: FontSizes.sm, fontWeight: '600' }}>{label}</Text>
        </View>
    );
}
