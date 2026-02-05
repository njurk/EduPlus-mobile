import SemesterPicker from '@/components/SemesterPicker';
import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { MobileNegativeAttendanceDto, mobileApi } from '@/services/api';
import { formatDate } from '@/utils/formatters';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ExcusesScreen() {
    const { selectedStudent } = useStudent();
    const [currentSemesterId, setCurrentSemesterId] = useState<number | null>(null);
    const [attendances, setAttendances] = useState<MobileNegativeAttendanceDto[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAttendances = async (semesterId: number) => {
        setLoading(true);
        try {
            const data = await mobileApi.getNegativeAttendances(selectedStudent?.id, semesterId);
            setAttendances(data);
            setSelectedIds(new Set());
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (currentSemesterId) loadAttendances(currentSemesterId);
    }, [selectedStudent]);

    const onSemesterChange = (id: number) => {
        setCurrentSemesterId(id);
        loadAttendances(id);
    };

    const onRefresh = useCallback(() => {
        if (!currentSemesterId) return;
        setRefreshing(true);
        loadAttendances(currentSemesterId);
    }, [currentSemesterId]);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleExcuse = () => {
        const selected = attendances.filter(a => selectedIds.has(a.id));
        router.push({
            pathname: '/(app)/excuse-form',
            params: { items: JSON.stringify(selected) }
        });
    };

    return (
        <View style={GlobalStyles.screen}>
            <ScrollView
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
            >
                <SemesterPicker onSemesterChange={onSemesterChange} />

                {loading ? (
                    <View style={[GlobalStyles.emptyContainer, { paddingTop: Spacing[8] }]}>
                        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                    </View>
                ) : attendances.length === 0 ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak nieobecności</Text>
                    </View>
                ) : (
                    <>
                        {attendances.map(attendance => {
                            const isSelected = selectedIds.has(attendance.id);
                            return (
                                <TouchableOpacity
                                    key={attendance.id}
                                    style={[
                                        GlobalStyles.card,
                                        {
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            borderWidth: 2,
                                            borderColor: isSelected ? Colors.primary.DEFAULT : 'transparent',
                                        }
                                    ]}
                                    onPress={() => toggleSelection(attendance.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 4,
                                        borderWidth: 2,
                                        borderColor: isSelected ? Colors.primary.DEFAULT : Colors.neutral[400],
                                        backgroundColor: isSelected ? Colors.primary.DEFAULT : 'transparent',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: Spacing[3],
                                    }}>
                                        {isSelected && <Check size={16} color="#fff" />}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: FontSizes.base, fontWeight: '600', color: Colors.neutral[800] }}>
                                            {attendance.subjectName}
                                        </Text>
                                        <Text style={GlobalStyles.caption}>
                                            {formatDate(attendance.date)} • Lekcja {attendance.lessonHour}
                                        </Text>
                                    </View>
                                    <View style={{
                                        backgroundColor: attendance.attendanceTypeColorHex,
                                        paddingHorizontal: Spacing[2],
                                        paddingVertical: Spacing[1],
                                        borderRadius: 4,
                                    }}>
                                        <Text style={{ color: '#fff', fontSize: FontSizes.sm, fontWeight: '600' }}>
                                            {attendance.attendanceType}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            {attendances.length > 0 && (
                <View style={{ padding: Spacing[4], backgroundColor: Colors.neutral[100] }}>
                    <TouchableOpacity
                        style={[
                            GlobalStyles.button,
                            { opacity: selectedIds.size === 0 ? 0.5 : 1 }
                        ]}
                        onPress={handleExcuse}
                        disabled={selectedIds.size === 0}
                    >
                        <Text style={GlobalStyles.buttonText}>
                            Usprawiedliw ({selectedIds.size})
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
