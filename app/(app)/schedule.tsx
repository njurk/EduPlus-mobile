import { GlobalStyles } from '@/constants/styles';
import { DAY_NAMES_SHORT } from '@/constants/locale';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { scheduleApi } from '@/services/api';
import type { MobileScheduleDto } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


export default function ScheduleScreen() {
    const { selectedStudent } = useStudent();
    const [schedule, setSchedule] = useState<MobileScheduleDto | null>(null);
    const [selectedDay, setSelectedDay] = useState(Math.min(new Date().getDay() - 1, 4));
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await scheduleApi.get(selectedStudent?.id);
            setSchedule(data);
        } catch { } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const today = new Date().getDay();
            setSelectedDay(today >= 1 && today <= 5 ? today - 1 : 0);
            loadData();
        }, [selectedStudent])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const todaysLessons = schedule?.lessons.filter(l => l.dayOfWeek === selectedDay + 1) || [];

    return (
        <View style={GlobalStyles.screen}>
            <View style={[GlobalStyles.row, { paddingHorizontal: Spacing[4], paddingVertical: Spacing[4], gap: Spacing[2] }]}>
                {DAY_NAMES_SHORT.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[GlobalStyles.dayButton, { flex: 1 }, selectedDay === index && GlobalStyles.dayButtonActive]}
                        onPress={() => setSelectedDay(index)}
                    >
                        <Text style={[GlobalStyles.dayButtonText, selectedDay === index && GlobalStyles.dayButtonTextActive]}>
                            {day}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
            >
                {(!schedule && !loading) || todaysLessons.length === 0 ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak</Text>
                    </View>
                ) : (
                    todaysLessons.map((lesson, index) => (
                        <View key={index} style={[GlobalStyles.row, GlobalStyles.cardSmall, { padding: Spacing[2] }]}>
                            <View style={{ width: Spacing[14], alignItems: 'center', borderRightWidth: 1, borderRightColor: Colors.neutral[100], marginRight: Spacing[3], paddingRight: Spacing[3] }}>
                                <Text style={{ fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.primary.DEFAULT }}>{lesson.orderNumber}</Text>
                                <Text style={GlobalStyles.caption}>{lesson.startTime}</Text>
                                <Text style={GlobalStyles.caption}>{lesson.endTime}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={GlobalStyles.title}>{lesson.subjectName}</Text>
                                <Text style={GlobalStyles.subtitle}>{lesson.teacherName}</Text>
                                {lesson.classroomName && (
                                    <Text style={GlobalStyles.caption}>Sala: {lesson.classroomName}</Text>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
