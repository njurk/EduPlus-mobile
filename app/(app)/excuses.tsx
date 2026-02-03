import { GlobalStyles } from '@/constants/styles';
import React from 'react';
import { Text, View } from 'react-native';

export default function ExcusesScreen() {
    return (
        <View style={[GlobalStyles.screen, GlobalStyles.emptyContainer]}>
            <Text style={GlobalStyles.headerMedium}>Usprawiedliwienia</Text>
            <Text style={GlobalStyles.emptyText}>Ta funkcja będzie wkrótce dostępna</Text>
        </View>
    );
}
