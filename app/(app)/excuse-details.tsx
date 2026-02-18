import StatusBadge from '@/components/StatusBadge';
import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import type { MobileExcuse } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function ExcuseDetailsScreen() {
    const { excuse } = useLocalSearchParams<{ excuse: string }>();
    const data: MobileExcuse = excuse ? JSON.parse(excuse) : null;

    if (!data) return null;

    return (
        <View style={GlobalStyles.screen}>
            <ScrollView contentContainerStyle={GlobalStyles.scrollContent}>
                <View style={[GlobalStyles.rowBetween, { alignItems: 'center', marginBottom: Spacing[4] }]}>
                    <Text style={GlobalStyles.sectionTitle}>Status:</Text>
                    <StatusBadge label={data.status} color={data.statusColorHex} />
                </View>

                <Text style={[GlobalStyles.sectionTitle, { marginBottom: Spacing[2] }]}>
                    Data wysłania:
                </Text>
                <View style={[GlobalStyles.card, { marginBottom: Spacing[4] }]}>
                    <Text style={{ fontSize: FontSizes.base, color: Colors.neutral[800] }}>
                        {formatDateTime(data.createdAt)}
                    </Text>
                </View>

                <Text style={[GlobalStyles.sectionTitle, { marginBottom: Spacing[2] }]}>
                    Nieobecności:
                </Text>
                {data.attendances.map(item => (
                    <View key={item.id} style={[GlobalStyles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[2] }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: FontSizes.base, fontWeight: '600', color: Colors.neutral[800] }}>
                                {item.subjectName}
                            </Text>
                            <Text style={GlobalStyles.caption}>
                                {item.date}, lekcja {item.lessonHour}
                            </Text>
                        </View>
                        <StatusBadge 
                            label={item.attendanceType} 
                            color={item.attendanceTypeColorHex} 
                        />
                    </View>
                ))}

                <Text style={[GlobalStyles.sectionTitle, { marginTop: Spacing[4], marginBottom: Spacing[2] }]}>
                    Treść:
                </Text>
                <View style={GlobalStyles.card}>
                    <Text style={{ 
                        fontSize: FontSizes.base, 
                        color: Colors.neutral[800], 
                        lineHeight: 22 
                    }}>
                        {data.reason}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}