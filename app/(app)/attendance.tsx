import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { mobileApi, MobileSubjectAttendanceDto } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';

export default function AttendanceScreen() {
    const [subjects, setSubjects] = useState<MobileSubjectAttendanceDto[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await mobileApi.getAttendance();
            setSubjects(data.subjects);
        } catch { } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const totalStats = subjects.reduce(
        (acc, s) => ({
            total: acc.total + s.totalLessons,
            present: acc.present + s.present,
            absent: acc.absent + s.absent,
            late: acc.late + s.late,
            excused: acc.excused + s.excused,
        }),
        { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
    );

    const overallPercentage = totalStats.total > 0
        ? Math.round(((totalStats.present + totalStats.late + totalStats.excused) / totalStats.total) * 100)
        : 0;

    return (
        <ScrollView
            style={GlobalStyles.screen}
            contentContainerStyle={GlobalStyles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
        >
            <View style={[GlobalStyles.card, { alignItems: 'center', padding: Spacing[5] }]}>
                <Text style={GlobalStyles.caption}>Ogólna frekwencja</Text>
                <Text style={{ fontSize: 48, fontWeight: '700', color: overallPercentage >= 80 ? Colors.success.DEFAULT : Colors.danger.DEFAULT, marginBottom: Spacing[4] }}>
                    {overallPercentage}%
                </Text>
                <View style={[GlobalStyles.row, { justifyContent: 'space-around', width: '100%' }]}>
                    {[
                        { label: 'Obecności', value: totalStats.present, color: Colors.success.DEFAULT },
                        { label: 'Nieobecności', value: totalStats.absent, color: Colors.danger.DEFAULT },
                        { label: 'Spóźnienia', value: totalStats.late, color: Colors.warning.DEFAULT },
                        { label: 'Zwolnienia', value: totalStats.excused, color: Colors.primary.DEFAULT },
                    ].map((stat, i) => (
                        <View key={i} style={{ alignItems: 'center' }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stat.color, marginBottom: Spacing[1] }} />
                            <Text style={{ fontSize: FontSizes.lg, fontWeight: '600', color: Colors.neutral[800] }}>{stat.value}</Text>
                            <Text style={GlobalStyles.caption}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <Text style={[GlobalStyles.title, { marginBottom: Spacing[3] }]}>Według przedmiotu</Text>

            {subjects.length === 0 && !loading ? (
                <View style={GlobalStyles.emptyContainer}>
                    <Text style={GlobalStyles.emptyText}>Brak danych frekwencji</Text>
                </View>
            ) : (
                subjects.map((subject, index) => (
                    <View key={index} style={GlobalStyles.cardSmall}>
                        <View style={GlobalStyles.rowBetween}>
                            <Text style={GlobalStyles.subtitle}>{subject.subjectName}</Text>
                            <Text style={{ fontSize: FontSizes.base, fontWeight: '700', color: subject.attendancePercentage >= 80 ? Colors.success.DEFAULT : Colors.danger.DEFAULT }}>
                                {subject.attendancePercentage}%
                            </Text>
                        </View>
                        <View style={[GlobalStyles.progressBar, { marginVertical: Spacing[2] }]}>
                            <View
                                style={[GlobalStyles.progressFill, {
                                    width: `${subject.attendancePercentage}%`,
                                    backgroundColor: subject.attendancePercentage >= 80 ? Colors.success.DEFAULT : Colors.danger.DEFAULT
                                }]}
                            />
                        </View>
                        <Text style={GlobalStyles.caption}>
                            OB: {subject.present} | NB: {subject.absent} | SP: {subject.late} | US: {subject.excused}
                        </Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
}
