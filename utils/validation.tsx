export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    POSTAL_CODE: /^\d{2}-\d{3}$/,
    PHONE: /^[0-9+\- ]*$/,
    PHONE_LENGTH: 9,
};

export const PASSWORD_RULES = [
    { label: "Min. 8 znaków", test: (p: string) => p.length >= 8 },
    { label: "Min. 1 duża litera", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Min. 1 cyfra", test: (p: string) => /[0-9]/.test(p) },
    { label: "Min. 1 znak specjalny", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const isValidEmail = (value: string): boolean => {
    return REGEX.EMAIL.test(value);
};

export const isPasswordValid = (password: string): boolean => {
    return PASSWORD_RULES.every(rule => rule.test(password));
};

export const isNotEmpty = (value: string): boolean => {
    return value.trim().length > 0;
};

export const hasMinLength = (value: string, minLength: number): boolean => {
    return value.length >= minLength;
};

export const validateLoginForm = (email: string, password: string): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
        errors.email = "Email jest wymagany";
    } else if (!isValidEmail(email)) {
        errors.email = "Nieprawidłowy format email";
    }

    if (!password) {
        errors.password = "Hasło jest wymagane";
    }

    return errors;
};

export const validateTicketForm = (email: string, content: string, reasonId: number | null): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
        errors.email = "Email jest wymagany";
    } else if (!isValidEmail(email)) {
        errors.email = "Nieprawidłowy format email";
    }

    if (!content.trim()) {
        errors.content = "Opis problemu jest wymagany";
    }

    if (!reasonId) {
        errors.reason = "Wybierz powód zgłoszenia";
    }

    return errors;
};

export const validatePasswordResetForm = (email: string): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
        errors.email = "Email jest wymagany";
    } else if (!isValidEmail(email)) {
        errors.email = "Nieprawidłowy format email";
    }

    return errors;
};

export const getPasswordErrors = (password: string): string[] => {
    return PASSWORD_RULES
        .filter(rule => !rule.test(password))
        .map(rule => rule.label);
};

export const validatePasswordChange = (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!currentPassword) {
        errors.currentPassword = "Aktualne hasło jest wymagane";
    }

    if (!newPassword) {
        errors.newPassword = "Nowe hasło jest wymagane";
    } else if (!isPasswordValid(newPassword)) {
        const failedRules = getPasswordErrors(newPassword);
        errors.newPassword = `Hasło nie spełnia wymogów: ${failedRules.join(', ')}`;
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Potwierdzenie hasła jest wymagane";
    } else if (newPassword !== confirmPassword) {
        errors.confirmPassword = "Hasła nie są identyczne";
    }

    return errors;
};

export const validateProfileForm = (profile: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    postalCode?: string | null;
}): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!profile.firstName?.trim()) {
        errors.firstName = "Imię jest wymagane";
    }

    if (!profile.lastName?.trim()) {
        errors.lastName = "Nazwisko jest wymagane";
    }

    if (profile.phone && !REGEX.PHONE.test(profile.phone)) {
        errors.phone = "Niedozwolone znaki w numerze telefonu";
    }

    if (profile.postalCode && !REGEX.POSTAL_CODE.test(profile.postalCode)) {
        errors.postalCode = "Wymagany format: XX-XXX";
    }

    return errors;
};
