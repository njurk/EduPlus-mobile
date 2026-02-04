import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { MobileAnnouncementDto, mobileApi, MobileAttendanceRecordDto, MobileRecentGradeDto, MobileScheduleDto } from '@/services/api';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const DAY_NAMES = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

export default function DashboardScreen() {
    const { user } = useAuth();
    const [recentGrades, setRecentGrades] = useState<MobileRecentGradeDto[]>([]);
    const [announcements, setAnnouncements] = useState<MobileAnnouncementDto[]>([]);
    const [todayLessons, setTodayLessons] = useState<MobileScheduleDto['lessons']>([]);
    const [recentAttendance, setRecentAttendance] = useState<MobileAttendanceRecordDto[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [gradesData, announcementsData, scheduleData, attendanceData] = await Promise.all([
                mobileApi.getGrades(),
                mobileApi.getAnnouncements(),
                mobileApi.getSchedule(),
                mobileApi.getAttendance(),
            ]);

            setRecentGrades(gradesData?.recentGrades?.slice(0, 3) || []);
            setAnnouncements(announcementsData?.slice(0, 3) || []);

            const today = new Date().getDay();
            const todaySchedule = scheduleData?.lessons?.filter(l => l.dayOfWeek === today) || [];
            todaySchedule.sort((a, b) => a.orderNumber - b.orderNumber);
            setTodayLessons(todaySchedule);

            setRecentAttendance(attendanceData?.recentRecords?.slice(0, 3) || []);
        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={GlobalStyles.screen}
            contentContainerStyle={GlobalStyles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
        >
            <View style={{ marginBottom: Spacing[6] }}>
                <Text style={GlobalStyles.headerLarge}>Witaj, {user?.name}!</Text>
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>Lekcje dzisiaj ({DAY_NAMES[new Date().getDay()]})</Text>
                {todayLessons.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak lekcji na dziś</Text>
                ) : (
                    todayLessons.map((lesson, index) => (
                        <View key={index} style={[GlobalStyles.rowBetween, GlobalStyles.divider]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
                                <Text style={{ fontSize: FontSizes.sm, color: Colors.neutral[500], minWidth: 85 }}>
                                    {lesson.startTime} - {lesson.endTime}
                                </Text>
                                <Text style={GlobalStyles.subtitle}>{lesson.subjectName}</Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>{lesson.classroomName}</Text>
                        </View>
                    ))
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>Ostatnia frekwencja</Text>
                {recentAttendance.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak danych o frekwencji</Text>
                ) : (
                    recentAttendance.map((record, index) => (
                        <View key={index} style={[GlobalStyles.rowBetween, GlobalStyles.divider]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
                                <View style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    backgroundColor: record.typeColorHex || Colors.neutral[200],
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text style={{ color: '#fff', fontSize: FontSizes.xs, fontWeight: '600' }}>{record.type}</Text>
                                </View>
                                <Text style={GlobalStyles.subtitle}>{record.subjectName}</Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>{record.date}</Text>
                        </View>
                    ))
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>Ostatnie oceny</Text>
                {recentGrades.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak ocen do wyświetlenia</Text>
                ) : (
                    recentGrades.map((grade, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[GlobalStyles.rowBetween, GlobalStyles.divider]}
                            onPress={() => router.push({ pathname: '/(app)/grades', params: { openGradeId: grade.id } })}
                            activeOpacity={0.7}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
                                <View style={[GlobalStyles.gradeBoxSmall, { backgroundColor: grade.categoryColorHex || Colors.neutral[200] }]}>
                                    <Text style={GlobalStyles.gradeValueSmall}>{grade.value}</Text>
                                </View>
                                <Text style={GlobalStyles.subtitle}>{grade.subjectName}</Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[400] }}>{grade.date}</Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>

            <View style={GlobalStyles.card}>
                <Text style={GlobalStyles.cardTitle}>Ostatnie ogłoszenia</Text>
                {announcements.length === 0 ? (
                    <Text style={GlobalStyles.emptyText}>Brak ogłoszeń</Text>
                ) : (
                    announcements.map((announcement) => (
                        <TouchableOpacity
                            key={announcement.id}
                            style={[GlobalStyles.row, GlobalStyles.divider, { gap: Spacing[2] }]}
                            onPress={() => router.push({ pathname: '/(app)/announcements', params: { openId: announcement.id } })}
                            activeOpacity={0.7}
                        >
                            {!announcement.isRead && (
                                <View style={GlobalStyles.badge}>
                                    <Text style={GlobalStyles.badgeText}>nowe</Text>
                                </View>
                            )}
                            <Text style={[GlobalStyles.subtitle, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
                                {announcement.title}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
}
