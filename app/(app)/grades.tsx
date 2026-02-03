import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { mobileApi, MobileSubjectGradesDto } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function GradesScreen() {
    const [subjects, setSubjects] = useState<MobileSubjectGradesDto[]>([]);
    const [expandedSubject, setExpandedSubject] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const data = await mobileApi.getGrades();
            setSubjects(data.subjects);
        } catch { } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const formatAverage = (avg: number | null) => {
        if (avg === null || avg === undefined) return '-';
        return avg.toFixed(2);
    };

    return (
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

                        <View style={[GlobalStyles.rowWrap, { marginTop: Spacing[3] }]}>
                            {subject.grades.slice(0, 8).map((grade, index) => (
                                <View
                                    key={index}
                                    style={[GlobalStyles.gradeBox, { backgroundColor: grade.categoryColorHex || Colors.neutral[300] }]}
                                >
                                    <Text style={GlobalStyles.gradeValue}>{grade.value}</Text>
                                </View>
                            ))}
                            {subject.grades.length > 8 && (
                                <View style={[GlobalStyles.gradeBox, { backgroundColor: Colors.neutral[200] }]}>
                                    <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[600] }}>+{subject.grades.length - 8}</Text>
                                </View>
                            )}
                        </View>

                        {expandedSubject === subject.subjectId && (
                            <View style={{ marginTop: Spacing[4], borderTopWidth: 1, borderTopColor: Colors.neutral[100], paddingTop: Spacing[3] }}>
                                {subject.grades.map((grade, index) => (
                                    <View key={index} style={[GlobalStyles.row, GlobalStyles.divider, { alignItems: 'flex-start' }]}>
                                        <View style={[GlobalStyles.gradeBoxSmall, { backgroundColor: grade.categoryColorHex || Colors.neutral[300] }]}>
                                            <Text style={GlobalStyles.gradeValueSmall}>{grade.value}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: Spacing[3] }}>
                                            <Text style={GlobalStyles.title}>{grade.categoryName}</Text>
                                            <Text style={GlobalStyles.caption}>{grade.teacherName}</Text>
                                            {grade.comment && <Text style={{ fontSize: FontSizes.xs, color: Colors.neutral[600], fontStyle: 'italic', marginTop: 2 }}>{grade.comment}</Text>}
                                        </View>
                                        <Text style={GlobalStyles.caption}>
                                            {new Date(grade.createdAt).toLocaleDateString('pl-PL')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </TouchableOpacity>
                ))
            )}
        </ScrollView>
    );
}
