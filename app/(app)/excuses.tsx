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
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ExcusesScreen() {
    const { selectedStudent } = useStudent();
    const { getText } = useCMSContent('mobileExcuses');
    const [attendances, setAttendances] = useState<MobileNegativeAttendance[]>([]);
    const [excuses, setExcuses] = useState<MobileExcuse[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'unexcused' | 'excused'>('unexcused');

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

    return (
        <View style={GlobalStyles.screen}>
            <View style={{ paddingHorizontal: Spacing[4], paddingTop: Spacing[2] }}>
                <SemesterPicker onSemesterChange={onSemesterChange} />
                
                <View style={{ flexDirection: 'row', marginBottom: Spacing[4] }}>
                    <TouchableOpacity 
                        onPress={() => setActiveTab('unexcused')}
                        style={{ flex: 1, paddingVertical: Spacing[3], borderBottomWidth: 2, borderBottomColor: activeTab === 'unexcused' ? Colors.primary.DEFAULT : 'transparent' }}
                    >
                        <Text style={{ fontSize: FontSizes.xs, textAlign: 'center', fontWeight: '700', color: activeTab === 'unexcused' ? Colors.primary.DEFAULT : Colors.neutral[500] }}>
                            {getText('section.unexcused')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setActiveTab('excused')}
                        style={{ flex: 1, paddingVertical: Spacing[3], borderBottomWidth: 2, borderBottomColor: activeTab === 'excused' ? Colors.primary.DEFAULT : 'transparent' }}
                    >
                        <Text style={{ fontSize: FontSizes.xs, textAlign: 'center', fontWeight: '700', color: activeTab === 'excused' ? Colors.primary.DEFAULT : Colors.neutral[500] }}>
                            {getText('section.excused')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={GlobalStyles.scrollContent} refreshControl={refreshControl}>
                <ListState loading={loading} empty={activeTab === 'unexcused' ? attendances.length === 0 : excuses.length === 0}>
                    {activeTab === 'unexcused' ? (
                        <View>
                            {attendances.map(attendance => {
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
                    ) : (
                        <View>
                            {excuses.map(excuse => (
                                <TouchableOpacity
                                    key={excuse.id}
                                    style={GlobalStyles.cardSmall}
                                    onPress={() => router.push({ pathname: '/(app)/excuse-details', params: { excuse: JSON.stringify(excuse) } })}
                                >
                                    <View style={[GlobalStyles.rowBetween, { alignItems: 'center' }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={GlobalStyles.title}>{formatDate(excuse.createdAt)}</Text>
                                            <Text style={[GlobalStyles.subtitle, { fontWeight: '400' }]} numberOfLines={1}>
                                                {excuse.reason}
                                            </Text>
                                        </View>
                                        <StatusBadge label={excuse.status} color={excuse.statusColorHex} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ListState>
            </ScrollView>

            {activeTab === 'unexcused' && attendances.length > 0 && (
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