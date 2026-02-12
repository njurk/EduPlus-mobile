import StatusBadge from '@/components/StatusBadge';
import { GlobalStyles } from '@/constants/styles';
import { DAY_NAMES_SHORT_W, MONTH_NAMES_SHORT } from '@/constants/locale';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { useCMSContent } from '@/hooks/useCMSContent';
import { attendanceApi } from '@/services/api';
import type { MobileAttendanceStat, MobileDailyLesson, MobileSubjectAttendance } from '@/types';
import { useRefresh } from '@/hooks/useRefresh';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import PieChart from 'react-native-pie-chart';

type TabType = 'week' | 'stats';

const getWeekDays = (baseDate: Date) => {
    const days = [];
    const dayOfWeek = baseDate.getDay();
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        days.push(day);
    }
    return days;
};

export default function AttendanceScreen() {
    const { selectedStudent } = useStudent();
    const { getText } = useCMSContent('mobileAttendance');
    const [activeTab, setActiveTab] = useState<TabType>('week');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [weekDays, setWeekDays] = useState(getWeekDays(new Date()));
    const [dailyLessons, setDailyLessons] = useState<MobileDailyLesson[]>([]);
    const [subjects, setSubjects] = useState<MobileSubjectAttendance[]>([]);
    const [stats, setStats] = useState<MobileAttendanceStat[]>([]);
    const [totalLessons, setTotalLessons] = useState(0);
    const [loading, setLoading] = useState(true);
    const selectedDateRef = useRef(selectedDate);

    const loadData = async (date: Date) => {
        try {
            const data = await attendanceApi.getAll(selectedStudent?.id, undefined, date);
            setDailyLessons(data.dailyLessons);
            setSubjects(data.subjects);
            setStats(data.stats);
            setTotalLessons(data.totalLessons);
        } catch { } finally {
            setLoading(false);
        }
    };

    const refreshLoader = useCallback(async () => {
        await loadData(selectedDateRef.current);
    }, []);

    useFocusEffect(
        useCallback(() => {
            const today = new Date();
            setSelectedDate(today);
            selectedDateRef.current = today;
            setWeekDays(getWeekDays(today));
            loadData(today);
        }, [selectedStudent])
    );

    const { refreshControl } = useRefresh(refreshLoader);

    const onDateSelect = async (date: Date) => {
        setSelectedDate(date);
        selectedDateRef.current = date;
        setLoading(true);
        await loadData(date);
    };

    const changeWeek = (direction: number) => {
        const newBase = new Date(weekDays[0]);
        newBase.setDate(newBase.getDate() + direction * 7);
        const newWeek = getWeekDays(newBase);
        setWeekDays(newWeek);
        const newSelected = newWeek.find(d => d.getDay() === selectedDate.getDay()) || newWeek[0];
        onDateSelect(newSelected);
    };

    const positiveCount = stats.filter(s => !s.isNegative).reduce((acc, s) => acc + s.count, 0);
    const overallPercentage = totalLessons > 0
        ? Math.round((positiveCount / totalLessons) * 100)
        : 0;

    const getAttendanceIcon = (type: string | null, color: string | null) => {
        if (!type) return null;
        return <StatusBadge label={type} color={color || Colors.neutral[200]} />;
    };

    const renderWeekTab = () => (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[4] }}>
                <TouchableOpacity onPress={() => changeWeek(-1)} style={{ padding: Spacing[2] }}>
                    <Text style={{ fontSize: FontSizes.lg, color: Colors.primary.DEFAULT }}>‹</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: Colors.primary.DEFAULT, marginHorizontal: Spacing[2] }}>
                    {MONTH_NAMES_SHORT[weekDays[0].getMonth()]}
                </Text>
                {weekDays.map((day, index) => {
                    const isSelected = day.toDateString() === selectedDate.toDateString();
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                        <TouchableOpacity
                            key={index}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: Spacing[2],
                                borderRadius: 8,
                                backgroundColor: isSelected ? Colors.primary.DEFAULT : 'transparent',
                            }}
                            onPress={() => onDateSelect(day)}
                        >
                            <Text style={{
                                fontSize: FontSizes.xs,
                                color: isSelected ? '#fff' : isToday ? Colors.primary.DEFAULT : Colors.neutral[500],
                            }}>
                                {DAY_NAMES_SHORT_W[day.getDay()]}
                            </Text>
                            <Text style={{
                                fontSize: FontSizes.base,
                                fontWeight: isSelected || isToday ? '700' : '400',
                                color: isSelected ? '#fff' : isToday ? Colors.primary.DEFAULT : Colors.neutral[800],
                            }}>
                                {day.getDate()}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
                <TouchableOpacity onPress={() => changeWeek(1)} style={{ padding: Spacing[2] }}>
                    <Text style={{ fontSize: FontSizes.lg, color: Colors.primary.DEFAULT }}>›</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={[GlobalStyles.emptyContainer, { paddingTop: Spacing[8] }]}>
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : dailyLessons.length === 0 ? (
                <View style={GlobalStyles.emptyContainer}>
                    <Text style={GlobalStyles.emptyText}>Brak lekcji</Text>
                </View>
            ) : (
                dailyLessons.map((lesson, index) => (
                    <View key={index} style={[GlobalStyles.cardSmall, { flexDirection: 'row', alignItems: 'center' }]}>
                        {getAttendanceIcon(lesson.attendanceType, lesson.attendanceTypeColorHex)}
                        {!lesson.attendanceType && (
                            <View style={[GlobalStyles.gradeBox, { backgroundColor: Colors.neutral[100] }]}>
                                <Text style={{ color: Colors.neutral[400], fontSize: FontSizes.xs }}>-</Text>
                            </View>
                        )}
                        <View style={{ flex: 1, marginLeft: Spacing[3] }}>
                            <Text style={GlobalStyles.title}>{lesson.subjectName}</Text>
                            <Text style={GlobalStyles.caption}>
                                {lesson.lessonOrder}. {lesson.startTime} - {lesson.endTime}
                            </Text>
                        </View>
                    </View>
                ))
            )}
        </>
    );

    const renderStatsTab = () => {
        const widthAndHeight = 190;
        const series = stats.map(s => ({ value: s.count, color: s.colorHex }));

        return (
            <View style={[GlobalStyles.card, { alignItems: 'center', padding: Spacing[5] }]}>
                {totalLessons > 0 && series.length > 0 && (
                    <View style={{ width: widthAndHeight, height: widthAndHeight, marginBottom: Spacing[4], alignItems: 'center', justifyContent: 'center' }}>
                        <PieChart
                            widthAndHeight={widthAndHeight}
                            series={series}
                            cover={{ radius: 0.5, color: Colors.light.card }}
                        />
                        <View style={{
                            position: 'absolute',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: Colors.primary.DEFAULT }}>{overallPercentage}%</Text>
                        </View>
                    </View>
                )}

                <Text style={GlobalStyles.subtitle}>Wszystkich lekcji: {totalLessons}</Text>
                <View style={{ width: '100%', marginTop: Spacing[5] }}>
                    {stats.map((stat, i) => (
                        <View key={i} style={[GlobalStyles.rowBetween, { paddingVertical: Spacing[2] }]}>
                            <View style={GlobalStyles.row}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: stat.colorHex, marginRight: Spacing[2] }} />
                                <Text style={GlobalStyles.subtitle}>{stat.name}</Text>
                            </View>
                            <Text style={{ fontSize: FontSizes.base, fontWeight: '600', color: Colors.neutral[800] }}>{stat.count}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <ScrollView
            style={GlobalStyles.screen}
            contentContainerStyle={GlobalStyles.scrollContent}
            refreshControl={refreshControl}
        >
            <View style={{ flexDirection: 'row', marginBottom: Spacing[4], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] }}>
                {[
                    { key: 'week' as TabType, label: getText('tabs.week') },
                    { key: 'stats' as TabType, label: getText('tabs.stats') },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={{
                            flex: 1,
                            paddingVertical: Spacing[2],
                            alignItems: 'center',
                            borderBottomWidth: 2,
                            borderBottomColor: activeTab === tab.key ? Colors.primary.DEFAULT : 'transparent',
                        }}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={{
                            fontSize: FontSizes.base,
                            fontWeight: activeTab === tab.key ? '600' : '400',
                            color: activeTab === tab.key ? Colors.primary.DEFAULT : Colors.neutral[500],
                        }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'week' ? renderWeekTab() : renderStatsTab()}
        </ScrollView>
    );
}
