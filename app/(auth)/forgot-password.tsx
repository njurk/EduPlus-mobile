import MessageBanner from '@/components/MessageBanner';
import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useCMSContent } from '@/hooks/useCMSContent';
import { authApi } from '@/services/api';
import { isPasswordValid, PASSWORD_RULES } from '@/utils/validation';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
    const { getText } = useCMSContent('resetPassword');
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSendCode = async () => {
        if (!email.trim() || !email.includes('@')) {
            setMessage({ type: 'error', text: 'Podaj poprawny adres email' });
            return;
        }
        setMessage(null);
        setIsLoading(true);
        try {
            await authApi.requestPasswordReset(email.trim());
        } catch { }
        setIsLoading(false);
        setStep('code');
    };

    const handleVerifyCode = async () => {
        if (code.trim().length !== 6) {
            setMessage({ type: 'error', text: 'Kod musi mieć 6 cyfr' });
            return;
        }
        setMessage(null);
        setIsLoading(true);
        try {
            await authApi.validateCode(code.trim());
            setStep('password');
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message.replace(/^"|"$/g, '') : 'Kod jest nieprawidłowy lub wygasł' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setMessage(null);
        if (!isPasswordValid(newPassword)) {
            setMessage({ type: 'error', text: 'Hasło nie spełnia wymagań' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Hasła nie są identyczne' });
            return;
        }
        setIsLoading(true);
        try {
            await authApi.resetPassword(code.trim(), newPassword);
            setMessage({ type: 'success', text: getText('message.success') });
            setTimeout(() => router.replace('/(auth)/login' as any), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message.replace(/^"|"$/g, '') : 'Nie udało się zresetować hasła' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={GlobalStyles.screen}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Spacing[6] }} keyboardShouldPersistTaps="handled">
                <View style={{ alignItems: 'center', marginBottom: Spacing[8] }}>
                    <Text style={[GlobalStyles.subtitle, { textAlign: 'center' }]}>
                        {step === 'email' && getText('subtitle')}
                        {step === 'code' && getText('message.codeSent').replace('{email}', email)}
                        {step === 'password' && getText('subtitle.reset')}
                    </Text>
                </View>

                <View style={[GlobalStyles.card, { padding: Spacing[6] }]}>
                    {message && <MessageBanner type={message.type} text={message.text} />}

                    {step === 'email' && (
                        <>
                            <View style={GlobalStyles.inputGroup}>
                                <Text style={GlobalStyles.label}>Email</Text>
                                <TextInput
                                    style={GlobalStyles.input}
                                    placeholder="jankowalski@gmail.com"
                                    placeholderTextColor={Colors.neutral[400]}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            <TouchableOpacity style={[GlobalStyles.buttonPrimary, isLoading && GlobalStyles.buttonDisabled]} onPress={handleSendCode} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={GlobalStyles.buttonPrimaryText}>Wyślij kod</Text>}
                            </TouchableOpacity>
                        </>
                    )}

                    {step === 'code' && (
                        <>
                            <View style={GlobalStyles.inputGroup}>
                                <Text style={GlobalStyles.label}>Kod z emaila</Text>
                                <TextInput
                                    style={[GlobalStyles.input, { textAlign: 'center', fontSize: FontSizes['2xl'], letterSpacing: 8 }]}
                                    placeholder="000000"
                                    placeholderTextColor={Colors.neutral[400]}
                                    value={code}
                                    onChangeText={setCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                            <TouchableOpacity style={GlobalStyles.buttonPrimary} onPress={handleVerifyCode}>
                                <Text style={GlobalStyles.buttonPrimaryText}>Dalej</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {step === 'password' && (
                        <>
                            <View style={GlobalStyles.inputGroup}>
                                <Text style={GlobalStyles.label}>Nowe hasło</Text>
                                <TextInput
                                    style={GlobalStyles.input}
                                    placeholder="******"
                                    placeholderTextColor={Colors.neutral[400]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                />
                                <View style={{ marginTop: Spacing[2] }}>
                                    {PASSWORD_RULES.map((rule, i) => (
                                        <Text key={i} style={{ fontSize: FontSizes.xs, color: rule.test(newPassword) ? Colors.success.DEFAULT : Colors.neutral[400] }}>
                                            {rule.test(newPassword) ? '✓' : '○'} {rule.label}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                            <View style={GlobalStyles.inputGroup}>
                                <Text style={GlobalStyles.label}>Potwierdź hasło</Text>
                                <TextInput
                                    style={[GlobalStyles.input, confirmPassword.length > 0 && newPassword !== confirmPassword && { borderColor: Colors.danger.DEFAULT }]}
                                    placeholder="******"
                                    placeholderTextColor={Colors.neutral[400]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                            </View>
                            <TouchableOpacity style={[GlobalStyles.buttonPrimary, isLoading && GlobalStyles.buttonDisabled]} onPress={handleResetPassword} disabled={isLoading}>
                                {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={GlobalStyles.buttonPrimaryText}>Zmień hasło</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <TouchableOpacity onPress={() => step === 'email' ? router.back() : setStep(step === 'password' ? 'code' : 'email')} style={{ marginTop: Spacing[6], alignItems: 'center' }}>
                    <Text style={{ color: Colors.neutral[500], fontSize: FontSizes.sm }}>
                        Wstecz
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
