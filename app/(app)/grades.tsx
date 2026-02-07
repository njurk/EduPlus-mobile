import SemesterPicker from '@/components/SemesterPicker';
import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { mobileApi, MobileSubjectGradesDto } from '@/services/api';
import { formatAverage, formatDateTime } from '@/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    RefreshControl,
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
    const { selectedStudent } = useStudent();
    const [currentSemesterId, setCurrentSemesterId] = useState<number | null>(null);
    const [subjects, setSubjects] = useState<MobileSubjectGradesDto[]>([]);
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<GradeDetail | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async (semesterId: number) => {
        setLoading(true);
        setExpandedSubject(null);
        try {
            const data = await mobileApi.getGrades(selectedStudent?.id, semesterId);
            setSubjects(data.subjects);
        } catch { } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const { openGradeId } = useLocalSearchParams<{ openGradeId?: string }>();

    useFocusEffect(useCallback(() => {
        if (currentSemesterId) loadData(currentSemesterId);
    }, [selectedStudent, currentSemesterId]));

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

    const onSemesterChange = (id: number) => {
        setCurrentSemesterId(id);
        loadData(id);
    };

    const onRefresh = async () => {
        if (!currentSemesterId) return;
        setRefreshing(true);
        await loadData(currentSemesterId);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={GlobalStyles.screen}
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
            >
                <SemesterPicker onSemesterChange={onSemesterChange} />

                {loading ? (
                    <View style={[GlobalStyles.emptyContainer, { paddingTop: Spacing[8] }]}>
                        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                    </View>
                ) : subjects.length === 0 ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak</Text>
                    </View>
                ) : (
                    subjects.map((subject) => (
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
                                        {formatAverage(subject.average)}
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
                                                {new Date(grade.createdAt).toLocaleDateString('pl-PL')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                )}
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
                                    style={[GlobalStyles.button, { marginTop: Spacing[6] }]}
                                    onPress={() => setSelectedGrade(null)}
                                >
                                    <Text style={GlobalStyles.buttonText}>Zamknij</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
