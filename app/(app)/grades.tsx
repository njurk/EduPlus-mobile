import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { mobileApi, MobileSubjectGradesDto } from '@/services/api';
import { formatAverage, formatDateTime } from '@/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
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
    const { openGradeId } = useLocalSearchParams<{ openGradeId?: string }>();
    const [subjects, setSubjects] = useState<MobileSubjectGradesDto[]>([]);
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<GradeDetail | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await mobileApi.getGrades();
            setSubjects(data.subjects);
            return data.subjects;
        } catch { } finally {
            setLoading(false);
        }
        return [];
    };

    useFocusEffect(
        useCallback(() => {
            loadData().then((loadedSubjects) => {
                if (openGradeId) {
                    const gradeId = Number(openGradeId);
                    for (const subject of loadedSubjects) {
                        const grade = subject.grades.find(g => g.id === gradeId);
                        if (grade) {
                            setExpandedSubject(subject.subjectId);
                            setSelectedGrade({ ...grade, subjectName: subject.subjectName });
                            break;
                        }
                    }
                    router.setParams({ openGradeId: undefined });
                }
            });
        }, [openGradeId])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={GlobalStyles.screen}
                contentContainerStyle={GlobalStyles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary.DEFAULT]} />}
            >
                {subjects.length === 0 && !loading ? (
                    <View style={GlobalStyles.emptyContainer}>
                        <Text style={GlobalStyles.emptyText}>Brak ocen do wyświetlenia</Text>
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
                                            <View style={[GlobalStyles.gradeBoxSmall, { backgroundColor: grade.categoryColorHex || Colors.neutral[300] }]}>
                                                <Text style={GlobalStyles.gradeValueSmall}>{grade.value}</Text>
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
                                    <View style={GlobalStyles.rowBetween}>
                                        <Text style={GlobalStyles.caption}>Nauczyciel</Text>
                                        <Text style={GlobalStyles.subtitle}>{selectedGrade.teacherName}</Text>
                                    </View>
                                    <View style={GlobalStyles.rowBetween}>
                                        <Text style={GlobalStyles.caption}>Waga</Text>
                                        <Text style={GlobalStyles.subtitle}>{selectedGrade.weight}</Text>
                                    </View>
                                    <View style={GlobalStyles.rowBetween}>
                                        <Text style={GlobalStyles.caption}>Data wystawienia</Text>
                                        <Text style={GlobalStyles.subtitle}>{formatDateTime(selectedGrade.createdAt)}</Text>
                                    </View>
                                    {selectedGrade.comment && (
                                        <View>
                                            <Text style={[GlobalStyles.caption, { marginBottom: Spacing[2] }]}>Komentarz</Text>
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
