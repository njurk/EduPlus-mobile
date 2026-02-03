import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useCMSContent } from '@/hooks/useCMSContent';
import { TicketReason, ticketsApi } from '@/services/api';
import { isValidEmail } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SubmitTicketScreen() {
    const { getText } = useCMSContent('submitTicket');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [reasons, setReasons] = useState<TicketReason[]>([]);
    const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
    const [showReasonPicker, setShowReasonPicker] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingReasons, setIsLoadingReasons] = useState(true);

    useEffect(() => {
        loadReasons();
    }, []);

    const loadReasons = async () => {
        try {
            const data = await ticketsApi.getReasons();
            setReasons(data);
            if (data.length > 0) {
                setSelectedReasonId(data[0].id);
            }
        } catch {
            setError('Nie udało się pobrać listy powodów');
        } finally {
            setIsLoadingReasons(false);
        }
    };

    const selectedReason = reasons.find(r => r.id === selectedReasonId);

    const handleSubmit = async () => {
        if (!email || !description) {
            setError('Wypełnij wszystkie pola');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Wprowadź poprawny adres email');
            return;
        }
        if (!selectedReasonId) {
            setError('Wybierz powód zgłoszenia');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await ticketsApi.createAnonymous({ email, content: description, reasonId: selectedReasonId });
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Nie udało się wysłać zgłoszenia');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <View style={[GlobalStyles.screen, { justifyContent: 'center', padding: Spacing[6] }]}>
                <View style={[GlobalStyles.card, { padding: Spacing[6], alignItems: 'center' }]}>
                    <Text style={[GlobalStyles.title, { marginBottom: Spacing[3], textAlign: 'center' }]}>
                        {getText('success.title', 'Zgłoszenie wysłane')}
                    </Text>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: Spacing[4] }]}>
                        {getText('success.message', 'Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.')}
                    </Text>
                    <TouchableOpacity
                        style={GlobalStyles.buttonPrimary}
                        onPress={() => router.back()}
                    >
                        <Text style={GlobalStyles.buttonPrimaryText}>Powrót do logowania</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={GlobalStyles.screen}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Spacing[6] }}>
                <View style={{ alignItems: 'center', marginBottom: Spacing[6] }}>
                    <Text style={{ fontSize: FontSizes['2xl'], fontWeight: '700', color: Colors.neutral[800], marginBottom: Spacing[2] }}>
                        {getText('title', 'Pomoc techniczna')}
                    </Text>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center' }]}>
                        {getText('subtitle', 'Opisz swój problem, a odpowiemy najszybciej jak to możliwe')}
                    </Text>
                </View>

                <View style={[GlobalStyles.card, { padding: Spacing[6] }]}>
                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Email kontaktowy</Text>
                        <TextInput
                            style={GlobalStyles.input}
                            placeholder="jan.kowalski@example.com"
                            placeholderTextColor={Colors.neutral[400]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Powód zgłoszenia</Text>
                        {isLoadingReasons ? (
                            <View style={[GlobalStyles.input, { justifyContent: 'center' }]}>
                                <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[GlobalStyles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                                onPress={() => setShowReasonPicker(true)}
                            >
                                <Text style={{ color: selectedReason ? Colors.neutral[800] : Colors.neutral[400], fontSize: FontSizes.base }}>
                                    {selectedReason?.name || 'Wybierz powód...'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>{getText('form.description', 'Opis problemu')}</Text>
                        <TextInput
                            style={[GlobalStyles.input, { height: 120, textAlignVertical: 'top' }]}
                            placeholder={getText('form.descriptionPlaceholder', 'Opisz szczegółowo problem...')}
                            placeholderTextColor={Colors.neutral[400]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                        />
                    </View>

                    {error ? <Text style={GlobalStyles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[GlobalStyles.buttonPrimary, isLoading && GlobalStyles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={GlobalStyles.buttonPrimaryText}>Wyślij</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing[6], alignItems: 'center' }}>
                    <Text style={{ color: Colors.neutral[500], fontSize: FontSizes.sm }}>Powrót do logowania</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={showReasonPicker}
                transparent
                animationType="none"
                onRequestClose={() => setShowReasonPicker(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: Spacing[6] }}
                    onPress={() => setShowReasonPicker(false)}
                >
                    <View style={[GlobalStyles.card, { padding: Spacing[4], maxHeight: 400 }]}>
                        <Text style={[GlobalStyles.title, { fontSize: FontSizes.lg, marginBottom: Spacing[4] }]}>
                            Wybierz powód zgłoszenia
                        </Text>
                        <ScrollView>
                            {reasons.map((reason) => (
                                <TouchableOpacity
                                    key={reason.id}
                                    style={{
                                        paddingVertical: Spacing[3],
                                        paddingHorizontal: Spacing[4],
                                        borderRadius: 8,
                                        backgroundColor: selectedReasonId === reason.id ? Colors.primary.light : 'transparent',
                                    }}
                                    onPress={() => {
                                        setSelectedReasonId(reason.id);
                                        setShowReasonPicker(false);
                                    }}
                                >
                                    <Text style={{
                                        fontSize: FontSizes.base,
                                        color: selectedReasonId === reason.id ? Colors.primary.hover : Colors.neutral[700],
                                        fontWeight: selectedReasonId === reason.id ? '600' : '400',
                                    }}>
                                        {reason.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
}
