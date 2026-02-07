import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useStudent } from '@/contexts/StudentContext';
import { MobileNegativeAttendanceDto, mobileApi } from '@/services/api';
import { formatDate } from '@/utils/formatters';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ExcuseFormScreen() {
    const { items } = useLocalSearchParams<{ items: string }>();
    const { selectedStudent } = useStudent();
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const selectedItems: MobileNegativeAttendanceDto[] = items ? JSON.parse(items) : [];

    const handleSubmit = async () => {
        if (!reason.trim()) {
            Alert.alert('Błąd', 'Podaj treść usprawiedliwienia');
            return;
        }

        setSubmitting(true);
        try {
            await mobileApi.createExcuse(selectedStudent?.id, {
                attendanceIds: selectedItems.map(item => item.id),
                reason: reason.trim(),
            });
            setReason('');
            router.navigate('/(app)/excuses');
            setTimeout(() => Alert.alert('Sukces', 'Usprawiedliwienie zostało wysłane'), 100);
        } catch (error) {
            Alert.alert('Błąd', 'Nie udało się wysłać usprawiedliwienia');
        } finally {
            setSubmitting(false);
        }
    };

    if (selectedItems.length === 0) {
        router.back();
        return null;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={GlobalStyles.screen}
        >
            <ScrollView contentContainerStyle={GlobalStyles.scrollContent}>
                <Text style={[GlobalStyles.sectionTitle, { marginBottom: Spacing[2] }]}>
                    Wybrane nieobecności:
                </Text>

                {selectedItems.map(item => (
                    <View key={item.id} style={[GlobalStyles.card, { flexDirection: 'row', alignItems: 'center' }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: FontSizes.base, fontWeight: '600', color: Colors.neutral[800] }}>
                                {item.subjectName}
                            </Text>
                            <Text style={GlobalStyles.caption}>
                                {formatDate(item.date)}, lekcja {item.lessonHour}
                            </Text>
                        </View>
                        <View style={{
                            backgroundColor: item.attendanceTypeColorHex,
                            paddingHorizontal: Spacing[2],
                            paddingVertical: Spacing[1],
                            borderRadius: 4,
                        }}>
                            <Text style={{ color: '#fff', fontSize: FontSizes.sm, fontWeight: '600' }}>
                                {item.attendanceType}
                            </Text>
                        </View>
                    </View>
                ))}

                <Text style={[GlobalStyles.sectionTitle, { marginTop: Spacing[4], marginBottom: Spacing[2] }]}>
                    Treść:
                </Text>

                <View style={GlobalStyles.card}>
                    <TextInput
                        style={{
                            minHeight: 120,
                            fontSize: FontSizes.base,
                            color: Colors.neutral[800],
                            textAlignVertical: 'top',
                        }}
                        placeholder="Wpisz powód..."
                        placeholderTextColor={Colors.neutral[400]}
                        multiline
                        value={reason}
                        onChangeText={setReason}
                        editable={!submitting}
                    />
                </View>

                <View style={{ paddingTop: Spacing[4] }}>
                    <TouchableOpacity
                        style={[
                            GlobalStyles.button,
                            { opacity: submitting || !reason.trim() ? 0.5 : 1 }
                        ]}
                        onPress={handleSubmit}
                        disabled={submitting || !reason.trim()}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={GlobalStyles.buttonText}>Wyślij</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
