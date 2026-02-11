import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useCMSContent } from '@/hooks/useCMSContent';
import { ticketsApi } from '@/services/api';
import type { TicketReason } from '@/types';
import { validateTicketForm } from '@/utils/validation';
import { router } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
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
    const { getText } = useCMSContent('mobileSubmitTicket');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [reasons, setReasons] = useState<TicketReason[]>([]);
    const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
    const [showReasonPicker, setShowReasonPicker] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingReasons, setIsLoadingReasons] = useState(true);

    useEffect(() => {
        loadReasons();
    }, []);

    useEffect(() => {
        const newErrors = validateTicketForm(email, description, selectedReasonId);
        setErrors(newErrors);
    }, [email, description, selectedReasonId]);

    const loadReasons = async () => {
        try {
            const data = await ticketsApi.getReasons();
            setReasons(data);
            if (data.length > 0) {
                setSelectedReasonId(data[0].id);
            }
        } catch {
            setApiError('Nie udało się pobrać powodów');
        } finally {
            setIsLoadingReasons(false);
        }
    };

    const selectedReason = reasons.find(r => r.id === selectedReasonId);

    const handleSubmit = async () => {
        const validationErrors = validateTicketForm(email, description, selectedReasonId);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setApiError('');
        setIsLoading(true);
        try {
            await ticketsApi.createAnonymous({ email, content: description, reasonId: selectedReasonId! });
            setSuccess(true);
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Nie udało się wysłać zgłoszenia');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <View style={[GlobalStyles.screen, { justifyContent: 'center', padding: Spacing[6] }]}>
                <View style={[GlobalStyles.card, { padding: Spacing[6], alignItems: 'center' }]}>
                    <Text style={[GlobalStyles.title, { marginBottom: Spacing[3], textAlign: 'center' }]}>
                        {getText('success.title')}
                    </Text>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginBottom: Spacing[4] }]}>
                        {getText('success.message')}
                    </Text>
                    <TouchableOpacity
                        style={GlobalStyles.buttonPrimary}
                        onPress={() => { setEmail(''); setDescription(''); setSuccess(false); router.back(); }}
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
                        {getText('title')}
                    </Text>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center' }]}>
                        {getText('subtitle')}
                    </Text>
                </View>

                <View style={[GlobalStyles.card, { padding: Spacing[6] }]}>
                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Email kontaktowy</Text>
                        <TextInput
                            style={[GlobalStyles.input, email.length > 0 && errors.email && { borderColor: Colors.danger.DEFAULT }]}
                            placeholder="jankowalski@gmail.com"
                            placeholderTextColor={Colors.neutral[400]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                        {email.length > 0 && errors.email && <Text style={GlobalStyles.errorText}>{errors.email}</Text>}
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
                                    {selectedReason?.name || 'wybierz powód...'}
                                </Text>
                                <ChevronDown size={20} color={Colors.neutral[400]} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Opis problemu</Text>
                        <TextInput
                            style={[GlobalStyles.input, { height: 120, textAlignVertical: 'top' }, description.length > 0 && errors.content && { borderColor: Colors.danger.DEFAULT }]}
                            placeholderTextColor={Colors.neutral[400]}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                        />
                        {description.length > 0 && errors.content && <Text style={GlobalStyles.errorText}>{errors.content}</Text>}
                    </View>

                    {apiError ? <Text style={GlobalStyles.errorText}>{apiError}</Text> : null}

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
