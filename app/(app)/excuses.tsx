import SemesterPicker from '@/components/SemesterPicker';
import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { useCMSContent } from '@/hooks/useCMSContent';
import { MobileExcuseDto, MobileNegativeAttendanceDto, mobileApi } from '@/services/api';
import { formatDate } from '@/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ExcusesScreen() {
    const { selectedStudent } = useStudent();
    const { getText } = useCMSContent('mobileExcuses');
    const [currentSemesterId, setCurrentSemesterId] = useState<number | null>(null);
    const [attendances, setAttendances] = useState<MobileNegativeAttendanceDto[]>([]);
    const [excuses, setExcuses] = useState<MobileExcuseDto[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedSection, setExpandedSection] = useState<'unexcused' | 'excused' | null>('unexcused');
    const [expandedExcuseId, setExpandedExcuseId] = useState<number | null>(null);

    const loadData = async (semesterId: number) => {
        setLoading(true);
        try {
            const [negativeData, excusesData] = await Promise.all([
                mobileApi.getNegativeAttendances(selectedStudent?.id, semesterId),
                mobileApi.getExcuses(selectedStudent?.id, semesterId)
            ]);
            setAttendances(negativeData);
            setExcuses(excusesData);
            setSelectedIds(new Set());
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => {
        if (currentSemesterId) loadData(currentSemesterId);
    }, [selectedStudent, currentSemesterId]));

    const onSemesterChange = (id: number) => {
        setCurrentSemesterId(id);
        loadData(id);
    };

    const onRefresh = useCallback(() => {
        if (!currentSemesterId) return;
        setRefreshing(true);
        loadData(currentSemesterId);
    }, [currentSemesterId]);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleExcuse = () => {
        const selected = attendances.filter(a => selectedIds.has(a.id));
        router.push({ pathname: '/(app)/excuse-form', params: { items: JSON.stringify(selected) } });
    };

    const SectionIcon = (section: 'unexcused' | 'excused') => expandedSection === section ? ChevronUp : ChevronDown;

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
                ) : (
                    <>
                        <TouchableOpacity
                            style={[GlobalStyles.cardSmall, { marginBottom: expandedSection === 'unexcused' ? 0 : Spacing[3] }]}
                            onPress={() => setExpandedSection(expandedSection === 'unexcused' ? null : 'unexcused')}
                        >
                            <View style={GlobalStyles.rowBetween}>
                                <Text style={GlobalStyles.title}>{getText('section.unexcused')} ({attendances.length})</Text>
                                {React.createElement(SectionIcon('unexcused'), { size: 20, color: Colors.neutral[500] })}
                            </View>
                        </TouchableOpacity>

                        {expandedSection === 'unexcused' && (
                            <View style={{ marginTop: Spacing[3] }}>
                                {attendances.length === 0 ? (
                                    <View style={[GlobalStyles.cardSmall, { alignItems: 'center' }]}>
                                        <Text style={GlobalStyles.caption}>Brak</Text>
                                    </View>
                                ) : attendances.map(attendance => {
                                    const isSelected = selectedIds.has(attendance.id);
                                    return (
                                        <TouchableOpacity
                                            key={attendance.id}
                                            style={[GlobalStyles.cardSmall, { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: isSelected ? Colors.primary.DEFAULT : 'transparent' }]}
                                            onPress={() => toggleSelection(attendance.id)}
                                        >
                                            <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: isSelected ? Colors.primary.DEFAULT : Colors.neutral[400], backgroundColor: isSelected ? Colors.primary.DEFAULT : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: Spacing[3] }}>
                                                {isSelected && <Check size={16} color="#fff" />}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: FontSizes.base, fontWeight: '600', color: Colors.neutral[800] }}>{attendance.subjectName}</Text>
                                                <Text style={GlobalStyles.caption}>{formatDate(attendance.date)}, lekcja {attendance.lessonHour}</Text>
                                            </View>
                                            <View style={{ backgroundColor: attendance.attendanceTypeColorHex, paddingHorizontal: Spacing[2], paddingVertical: Spacing[1], borderRadius: 4 }}>
                                                <Text style={{ color: '#fff', fontSize: FontSizes.sm, fontWeight: '600' }}>{attendance.attendanceType}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        <TouchableOpacity
                            style={GlobalStyles.cardSmall}
                            onPress={() => setExpandedSection(expandedSection === 'excused' ? null : 'excused')}
                        >
                            <View style={GlobalStyles.rowBetween}>
                                <Text style={GlobalStyles.title}>{getText('section.excused')} ({excuses.length})</Text>
                                {React.createElement(SectionIcon('excused'), { size: 20, color: Colors.neutral[500] })}
                            </View>
                        </TouchableOpacity>

                        {expandedSection === 'excused' && (
                            <View>
                                {excuses.length === 0 ? (
                                    <View style={[GlobalStyles.cardSmall, { alignItems: 'center' }]}>
                                        <Text style={GlobalStyles.caption}>Brak</Text>
                                    </View>
                                ) : excuses.map(excuse => (
                                    <TouchableOpacity
                                        key={excuse.id}
                                        style={GlobalStyles.cardSmall}
                                        onPress={() => setExpandedExcuseId(expandedExcuseId === excuse.id ? null : excuse.id)}
                                    >
                                        <View style={GlobalStyles.rowBetween}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={GlobalStyles.title}>{formatDate(excuse.createdAt)}</Text>
                                                <Text style={[GlobalStyles.subtitle, { fontWeight: '400' }]} numberOfLines={expandedExcuseId === excuse.id ? undefined : 2}>{excuse.reason}</Text>
                                            </View>
                                            <View style={{ backgroundColor: excuse.statusColorHex, paddingHorizontal: Spacing[2], paddingVertical: Spacing[1], borderRadius: 4, marginLeft: Spacing[2] }}>
                                                <Text style={{ color: '#fff', fontSize: FontSizes.sm, fontWeight: '600' }}>{excuse.status}</Text>
                                            </View>
                                        </View>
                                        {expandedExcuseId === excuse.id && (
                                            <View style={{ marginTop: Spacing[2], paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.neutral[200] }}>
                                                <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: Colors.neutral[600], marginBottom: Spacing[1] }}>Nieobecności:</Text>
                                                {excuse.attendances.map(att => (
                                                    <Text key={att.id} style={{ fontSize: FontSizes.sm, color: Colors.neutral[600] }}>• {att.subjectName} ({att.date}, lekcja {att.lessonHour})</Text>
                                                ))}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {expandedSection === 'unexcused' && attendances.length > 0 && (
                <View style={{ padding: Spacing[4], backgroundColor: Colors.neutral[100] }}>
                    <TouchableOpacity
                        style={[GlobalStyles.button, { opacity: selectedIds.size === 0 ? 0.5 : 1 }]}
                        onPress={handleExcuse}
                        disabled={selectedIds.size === 0}
                    >
                        <Text style={GlobalStyles.buttonText}>Usprawiedliw ({selectedIds.size})</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
