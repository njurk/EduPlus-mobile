import { GlobalStyles } from '@/constants/styles';
import { Colors } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function FullScreenLoader() {
    return (
        <View style={[GlobalStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
        </View>
    );
}
