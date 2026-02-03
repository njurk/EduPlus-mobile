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
