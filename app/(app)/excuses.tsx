import ListState from '@/components/ListState';
import SemesterPicker from '@/components/SemesterPicker';
import StatusBadge from '@/components/StatusBadge';
import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { useSemesterLoader } from '@/hooks/useSemesterLoader';
import { useCMSContent } from '@/hooks/useCMSContent';
import { attendanceApi, excusesApi } from '@/services/api';
import type { MobileExcuse, MobileNegativeAttendance } from '@/types';
import { formatDate } from '@/utils/formatters';
import { router } from 'expo-router';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ExcusesScreen() {
    const { selectedStudent } = useStudent();
    const { getText } = useCMSContent('mobileExcuses');
    const [attendances, setAttendances] = useState<MobileNegativeAttendance[]>([]);
    const [excuses, setExcuses] = useState<MobileExcuse[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState<'unexcused' | 'excused' | null>('unexcused');
    const [expandedExcuseId, setExpandedExcuseId] = useState<number | null>(null);

    const loadData = async (semesterId: number) => {
        setLoading(true);
        try {
            const [negativeData, excusesData] = await Promise.all([
                attendanceApi.getNegative(selectedStudent?.id, semesterId),
                excusesApi.getAll(selectedStudent?.id, semesterId)
            ]);
            setAttendances(negativeData);
            setExcuses(excusesData);
            setSelectedIds(new Set());
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const { onSemesterChange, refreshControl } = useSemesterLoader(loadData);

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
                refreshControl={refreshControl}
            >
                <SemesterPicker onSemesterChange={onSemesterChange} />

                <ListState loading={loading} empty={attendances.length === 0 && excuses.length === 0}>
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
                                            <StatusBadge label={attendance.attendanceType} color={attendance.attendanceTypeColorHex} />
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
                                            <StatusBadge label={excuse.status} color={excuse.statusColorHex} />
                                        </View>
                                        {expandedExcuseId === excuse.id && (
                                            <View style={{ marginTop: Spacing[2], paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.neutral[200] }}>
                                                <Text style={{ fontSize: FontSizes.sm, fontWeight: '600', color: Colors.neutral[600], marginBottom: Spacing[1] }}>Nieobecności:</Text>
                                                {excuse.attendances.map(att => (
                                                    <Text key={att.id} style={{ fontSize: FontSizes.sm, color: Colors.neutral[600] }}>- {att.subjectName} ({att.date}, lekcja {att.lessonHour})</Text>
                                                ))}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                </ListState>
            </ScrollView>

            {expandedSection === 'unexcused' && attendances.length > 0 && (
                <View style={{ padding: Spacing[4], backgroundColor: Colors.neutral[100] }}>
                    <TouchableOpacity
                        style={[GlobalStyles.buttonPrimary, { opacity: selectedIds.size === 0 ? 0.5 : 1 }]}
                        onPress={handleExcuse}
                        disabled={selectedIds.size === 0}
                    >
                        <Text style={GlobalStyles.buttonPrimaryText}>Usprawiedliw ({selectedIds.size})</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
