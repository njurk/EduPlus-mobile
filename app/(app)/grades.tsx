import ListState from '@/components/ListState';
import SemesterPicker from '@/components/SemesterPicker';
import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useSemesterLoader } from '@/hooks/useSemesterLoader';
import { gradesApi } from '@/services/api';
import type { MobileSubjectGrades } from '@/types';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface GradeDetail {
    id: number;
    value: string;
    categoryName: string;
    categoryColorHex: string;
    teacherName: string;
    comment: string | null;
    weight: number;
    createdAt: string;
    subjectName: string;
}

export default function GradesScreen() {
    const [subjects, setSubjects] = useState<MobileSubjectGrades[]>([]);
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<GradeDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async (semesterId: number) => {
        setLoading(true);
        setExpandedSubject(null);
        try {
            const data = await gradesApi.getAll(undefined, semesterId);
            setSubjects(data.subjects);
        } catch { } finally {
            setLoading(false);
        }
    };

    const { onSemesterChange, refreshControl } = useSemesterLoader(loadData);
    const { openGradeId } = useLocalSearchParams<{ openGradeId?: string }>();

    useEffect(() => {
        if (openGradeId && subjects.length > 0) {
            const gradeId = Number(openGradeId);
            for (const subject of subjects) {
                const grade = subject.grades.find(g => g.id === gradeId);
                if (grade) {
                    setExpandedSubject(subject.subjectId);
                    setSelectedGrade({ ...grade, subjectName: subject.subjectName });
                    break;
                }
            }
        }
    }, [openGradeId, subjects]);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={GlobalStyles.screen}
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={refreshControl}
            >
                <SemesterPicker onSemesterChange={onSemesterChange} />

                <ListState loading={loading} empty={subjects.length === 0}>
                    {subjects.map((subject) => (
                        <TouchableOpacity
                            key={subject.subjectId}
                            style={GlobalStyles.cardSmall}
                            onPress={() => setExpandedSubject(expandedSubject === subject.subjectId ? null : subject.subjectId)}
                            activeOpacity={0.7}
                        >
                            <View style={GlobalStyles.rowBetween}>
                                <Text style={GlobalStyles.title}>{subject.subjectName}</Text>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={GlobalStyles.caption}>Średnia</Text>
                                    <Text style={{ fontSize: FontSizes.lg, fontWeight: '700', color: Colors.primary.DEFAULT }}>
                                        {subject.average?.toFixed(2) ?? '-'}
                                    </Text>
                                </View>
                            </View>

                            {expandedSubject === subject.subjectId && (
                                <View style={{ marginTop: Spacing[3], borderTopWidth: 1, borderTopColor: Colors.neutral[100], paddingTop: Spacing[3] }}>
                                    {subject.grades.map((grade, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[GlobalStyles.row, GlobalStyles.divider, { alignItems: 'flex-start' }]}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                setSelectedGrade({ ...grade, subjectName: subject.subjectName });
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[GlobalStyles.gradeBox, { backgroundColor: grade.categoryColorHex || Colors.neutral[300] }]}>
                                                <Text style={GlobalStyles.gradeValue}>{grade.value}</Text>
                                            </View>
                                            <View style={{ flex: 1, marginLeft: Spacing[3] }}>
                                                <Text style={GlobalStyles.title}>{grade.categoryName}</Text>
                                                <Text style={GlobalStyles.caption}>{grade.teacherName}</Text>
                                            </View>
                                            <Text style={GlobalStyles.caption}>
                                                {formatDate(grade.createdAt)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ListState>
            </ScrollView>

            <Modal
                visible={selectedGrade !== null}
                transparent
                animationType="none"
                onRequestClose={() => setSelectedGrade(null)}
            >
                <TouchableOpacity
                    style={GlobalStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedGrade(null)}
                >
                    <View style={GlobalStyles.modalContent} onStartShouldSetResponder={() => true}>
                        {selectedGrade && (
                            <>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[4] }}>
                                    <View style={[GlobalStyles.gradeBox, { backgroundColor: selectedGrade.categoryColorHex || Colors.neutral[300], marginRight: Spacing[4] }]}>
                                        <Text style={GlobalStyles.gradeValue}>{selectedGrade.value}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={GlobalStyles.headerLarge}>{selectedGrade.categoryName}</Text>
                                        <Text style={GlobalStyles.subtitle}>{selectedGrade.subjectName}</Text>
                                    </View>
                                </View>

                                <View style={{ gap: Spacing[4] }}>
                                    <View>
                                        <Text style={GlobalStyles.caption}>Nauczyciel</Text>
                                        <Text style={GlobalStyles.subtitle}>{selectedGrade.teacherName}</Text>
                                    </View>
                                    <View>
                                        <Text style={GlobalStyles.caption}>Waga</Text>
                                        <Text style={GlobalStyles.subtitle}>{selectedGrade.weight}</Text>
                                    </View>
                                    <View>
                                        <Text style={GlobalStyles.caption}>Data wystawienia</Text>
                                        <Text style={GlobalStyles.subtitle}>{formatDateTime(selectedGrade.createdAt)}</Text>
                                    </View>
                                    {selectedGrade.comment && (
                                        <View>
                                            <Text style={GlobalStyles.caption}>Komentarz</Text>
                                            <Text style={GlobalStyles.subtitle}>{selectedGrade.comment}</Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={[GlobalStyles.buttonPrimary, { marginTop: Spacing[6] }]}
                                    onPress={() => setSelectedGrade(null)}
                                >
                                    <Text style={GlobalStyles.buttonPrimaryText}>Zamknij</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
