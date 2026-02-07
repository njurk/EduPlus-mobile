import { GlobalStyles } from '@/constants/styles';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile, usersApi } from '@/services/api';
import { PASSWORD_RULES, validatePasswordChange, validateProfileForm } from '@/utils/validation';
import { CheckCircle, Lock, User, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            const errors = validateProfileForm(profile);
            setProfileErrors(errors);
        }
    }, [profile]);

    useEffect(() => {
        const errors = validatePasswordChange(currentPassword, newPassword, confirmPassword);
        setPasswordErrors(errors);
    }, [currentPassword, newPassword, confirmPassword]);

    const loadProfile = async () => {
        if (!user) return;
        try {
            const data = await usersApi.get(user.id);
            setProfile(data);
        } catch (error) {
            Alert.alert('Błąd', 'Nie udało się pobrać danych');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!profile) return;

        const errors = validateProfileForm(profile);
        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }

        setSaving(true);
        setProfileMessage(null);
        try {
            await usersApi.update(profile.id, {
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
                street: profile.street,
                city: profile.city,
                postalCode: profile.postalCode,
            });
            setProfileMessage({ type: 'success', text: 'Dane zostały zaktualizowane' });
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message || 'Nie udało się zapisać danych' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!profile) return;

        const errors = validatePasswordChange(currentPassword, newPassword, confirmPassword);
        if (Object.keys(errors).length > 0) {
            return;
        }

        setSaving(true);
        setPasswordMessage(null);
        try {
            await usersApi.changePassword(profile.id, {
                currentPassword,
                newPassword,
            });
            setPasswordMessage({ type: 'success', text: 'Hasło zostało zmienione' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: error.message || 'Nie udało się zmienić hasła' });
        } finally {
            setSaving(false);
        }
    };

    const hasPasswordInput = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

    if (loading) {
        return (
            <View style={[GlobalStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={GlobalStyles.screen}
        >
            <ScrollView contentContainerStyle={GlobalStyles.scrollContent}>
                <View style={GlobalStyles.card}>
                    <View style={[GlobalStyles.row, { marginBottom: Spacing[4] }]}>
                        <User size={20} color={Colors.primary.DEFAULT} />
                        <Text style={[GlobalStyles.cardTitle, { marginBottom: 0, marginLeft: Spacing[2] }]}>Dane osobiste</Text>
                    </View>

                    {profileMessage && (
                        <View style={{
                            backgroundColor: profileMessage.type === 'success' ? Colors.success.light : Colors.danger.light,
                            padding: Spacing[3],
                            borderRadius: 8,
                            marginBottom: Spacing[4]
                        }}>
                            <Text style={{ color: profileMessage.type === 'success' ? Colors.success.text : Colors.danger.text, fontSize: FontSizes.sm }}>
                                {profileMessage.text}
                            </Text>
                        </View>
                    )}

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Imię</Text>
                        <TextInput
                            style={[GlobalStyles.input, profileErrors.firstName && { borderColor: Colors.danger.DEFAULT }]}
                            value={profile?.firstName || ''}
                            onChangeText={(text) => setProfile(prev => prev ? { ...prev, firstName: text } : null)}
                        />
                        {profileErrors.firstName && <Text style={GlobalStyles.errorText}>{profileErrors.firstName}</Text>}
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Nazwisko</Text>
                        <TextInput
                            style={[GlobalStyles.input, profileErrors.lastName && { borderColor: Colors.danger.DEFAULT }]}
                            value={profile?.lastName || ''}
                            onChangeText={(text) => setProfile(prev => prev ? { ...prev, lastName: text } : null)}
                        />
                        {profileErrors.lastName && <Text style={GlobalStyles.errorText}>{profileErrors.lastName}</Text>}
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Email</Text>
                        <TextInput
                            style={[GlobalStyles.input, { backgroundColor: Colors.neutral[100], color: Colors.neutral[500] }]}
                            value={profile?.email || ''}
                            editable={false}
                        />
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Telefon</Text>
                        <TextInput
                            style={[GlobalStyles.input, profileErrors.phone && { borderColor: Colors.danger.DEFAULT }]}
                            value={profile?.phone || ''}
                            onChangeText={(text) => setProfile(prev => prev ? { ...prev, phone: text } : null)}
                            keyboardType="phone-pad"
                            placeholder="123 456 789"
                            placeholderTextColor={Colors.neutral[400]}
                        />
                        {profileErrors.phone && <Text style={GlobalStyles.errorText}>{profileErrors.phone}</Text>}
                    </View>

                    <View style={{ borderTopWidth: 1, borderTopColor: Colors.neutral[100], paddingTop: Spacing[4], marginTop: Spacing[2] }}>
                        <Text style={{ fontSize: FontSizes.xs, fontWeight: '600', color: Colors.neutral[500], textTransform: 'uppercase', marginBottom: Spacing[3] }}>
                            Adres zamieszkania
                        </Text>

                        <View style={GlobalStyles.inputGroup}>
                            <Text style={GlobalStyles.label}>Ulica i numer</Text>
                            <TextInput
                                style={GlobalStyles.input}
                                value={profile?.street || ''}
                                onChangeText={(text) => setProfile(prev => prev ? { ...prev, street: text } : null)}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
                            <View style={[GlobalStyles.inputGroup, { flex: 1 }]}>
                                <Text style={GlobalStyles.label}>Kod pocztowy</Text>
                                <TextInput
                                    style={[GlobalStyles.input, profileErrors.postalCode && { borderColor: Colors.danger.DEFAULT }]}
                                    value={profile?.postalCode || ''}
                                    onChangeText={(text) => setProfile(prev => prev ? { ...prev, postalCode: text } : null)}
                                    placeholder="00-000"
                                    placeholderTextColor={Colors.neutral[400]}
                                />
                                {profileErrors.postalCode && <Text style={GlobalStyles.errorText}>{profileErrors.postalCode}</Text>}
                            </View>
                            <View style={[GlobalStyles.inputGroup, { flex: 2 }]}>
                                <Text style={GlobalStyles.label}>Miasto</Text>
                                <TextInput
                                    style={GlobalStyles.input}
                                    value={profile?.city || ''}
                                    onChangeText={(text) => setProfile(prev => prev ? { ...prev, city: text } : null)}
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[GlobalStyles.buttonPrimary, saving && GlobalStyles.buttonDisabled]}
                        onPress={handleUpdateProfile}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={Colors.white} />
                        ) : (
                            <Text style={GlobalStyles.buttonPrimaryText}>Zapisz</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={GlobalStyles.card}>
                    <View style={[GlobalStyles.row, { marginBottom: Spacing[4] }]}>
                        <Lock size={20} color={Colors.primary.DEFAULT} />
                        <Text style={[GlobalStyles.cardTitle, { marginBottom: 0, marginLeft: Spacing[2] }]}>Zmiana hasła</Text>
                    </View>

                    {passwordMessage && (
                        <View style={{
                            backgroundColor: passwordMessage.type === 'success' ? Colors.success.light : Colors.danger.light,
                            padding: Spacing[3],
                            borderRadius: 8,
                            marginBottom: Spacing[4]
                        }}>
                            <Text style={{ color: passwordMessage.type === 'success' ? Colors.success.text : Colors.danger.text, fontSize: FontSizes.sm }}>
                                {passwordMessage.text}
                            </Text>
                        </View>
                    )}

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Aktualne hasło</Text>
                        <TextInput
                            style={[GlobalStyles.input, currentPassword.length > 0 && passwordErrors.currentPassword && { borderColor: Colors.danger.DEFAULT }]}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                        />
                        {currentPassword.length > 0 && passwordErrors.currentPassword && (
                            <Text style={GlobalStyles.errorText}>{passwordErrors.currentPassword}</Text>
                        )}
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Nowe hasło</Text>
                        <TextInput
                            style={[GlobalStyles.input, newPassword.length > 0 && passwordErrors.newPassword && { borderColor: Colors.danger.DEFAULT }]}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                        {newPassword.length > 0 && (
                            <View style={{ marginTop: Spacing[2] }}>
                                {PASSWORD_RULES.map((rule, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[1] }}>
                                        {rule.test(newPassword) ? (
                                            <CheckCircle size={16} color={Colors.success.DEFAULT} />
                                        ) : (
                                            <XCircle size={16} color={Colors.danger.DEFAULT} />
                                        )}
                                        <Text style={{
                                            marginLeft: Spacing[1],
                                            fontSize: FontSizes.xs,
                                            color: rule.test(newPassword) ? Colors.success.DEFAULT : Colors.danger.DEFAULT
                                        }}>
                                            {rule.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={GlobalStyles.inputGroup}>
                        <Text style={GlobalStyles.label}>Potwierdź nowe hasło</Text>
                        <TextInput
                            style={[GlobalStyles.input, confirmPassword.length > 0 && passwordErrors.confirmPassword && { borderColor: Colors.danger.DEFAULT }]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                        {confirmPassword.length > 0 && passwordErrors.confirmPassword && (
                            <Text style={GlobalStyles.errorText}>{passwordErrors.confirmPassword}</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[GlobalStyles.buttonSecondary, (saving || (hasPasswordInput && Object.keys(passwordErrors).length > 0)) && GlobalStyles.buttonDisabled]}
                        onPress={handleChangePassword}
                        disabled={saving || (hasPasswordInput && Object.keys(passwordErrors).length > 0)}
                    >
                        {saving ? (
                            <ActivityIndicator color={Colors.neutral[600]} />
                        ) : (
                            <Text style={GlobalStyles.buttonSecondaryText}>Zmień hasło</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
