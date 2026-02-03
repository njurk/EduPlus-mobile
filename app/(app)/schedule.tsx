import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { mobileApi, MobileScheduleDto } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

export default function ScheduleScreen() {
    const [schedule, setSchedule] = useState<MobileScheduleDto | null>(null);
    const [selectedDay, setSelectedDay] = useState(Math.min(new Date().getDay() - 1, 4));
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await mobileApi.getSchedule();
            setSchedule(data);
        } catch { } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        if (selectedDay < 0) setSelectedDay(0);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const todaysLessons = schedule?.lessons.filter(l => l.dayOfWeek === selectedDay + 1) || [];

    return (
        <View style={GlobalStyles.screen}>
            <View style={{ paddingHorizontal: Spacing[4], paddingTop: Spacing[4], paddingBottom: Spacing[2] }}>
                {schedule && (
                    <Text style={[GlobalStyles.caption, { textAlign: 'center' }]}>
                        Klasa {schedule.className} • {schedule.semesterName}
                    </Text>
                )}
            </View>

            <View style={[GlobalStyles.row, { paddingHorizontal: Spacing[4], paddingVertical: Spacing[2], gap: Spacing[2] }]}>
                {DAYS.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[GlobalStyles.dayButton, selectedDay === index && GlobalStyles.dayButtonActive]}
                        onPress={() => setSelectedDay(index)}
                    >
                        <Text style={[GlobalStyles.dayButtonText, selectedDay === index && GlobalStyles.dayButtonTextActive]}>
                            {day.substring(0, 3)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
            >
                {!schedule && !loading ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak planu lekcji</Text>
                    </View>
                ) : todaysLessons.length === 0 ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak lekcji w {DAYS[selectedDay]}</Text>
                    </View>
                ) : (
                    todaysLessons.map((lesson, index) => (
                        <View key={index} style={[GlobalStyles.row, GlobalStyles.cardSmall, { padding: Spacing[3] }]}>
                            <View style={{ width: 50, alignItems: 'center', borderRightWidth: 1, borderRightColor: Colors.neutral[100], marginRight: Spacing[3], paddingRight: Spacing[3] }}>
                                <Text style={{ fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.primary.DEFAULT }}>{lesson.orderNumber}</Text>
                                <Text style={GlobalStyles.caption}>{lesson.startTime}</Text>
                                <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>{lesson.endTime}</Text>
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
