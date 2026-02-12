import { StyleSheet } from 'react-native';
import { BorderRadius, Colors, FontSizes, Spacing } from './theme';

export const GlobalStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: Spacing[4],
        paddingBottom: Spacing[8],
    },

    card: {
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.sm,
        padding: Spacing[4],
        marginBottom: Spacing[4],
    },
    cardSmall: {
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.sm,
        padding: Spacing[3],
        marginBottom: Spacing[3],
    },
    cardTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: Colors.neutral[800],
        marginBottom: Spacing[3],
    },

    headerLarge: {
        fontSize: FontSizes['2xl'],
        fontWeight: '700',
        color: Colors.neutral[900],
    },
    title: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: Colors.neutral[800],
    },
    subtitle: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        color: Colors.neutral[600],
    },
    caption: {
        fontSize: FontSizes.xs,
        color: Colors.neutral[500],
    },
    sectionTitle: {
        fontSize: FontSizes.base,
        fontWeight: '600',
        color: Colors.neutral[700],
    },
    emptyText: {
        fontSize: FontSizes.sm,
        color: Colors.neutral[500],
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing[16],
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing[1],
    },
    divider: {
        paddingVertical: Spacing[2],
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[100],
    },

    inputGroup: {
        marginBottom: Spacing[4],
    },
    label: {
        fontSize: FontSizes.sm,
        fontWeight: '500',
        color: Colors.neutral[700],
        marginBottom: Spacing[1],
    },
    input: {
        backgroundColor: Colors.neutral[50],
        borderWidth: 1,
        borderColor: Colors.neutral[300],
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing[3],
        paddingVertical: Spacing[2.5],
        fontSize: FontSizes.base,
        color: Colors.neutral[800],
    },
    errorText: {
        color: Colors.danger.DEFAULT,
        fontSize: FontSizes.sm,
        marginBottom: Spacing[2],
    },

    buttonPrimary: {
        backgroundColor: Colors.primary.DEFAULT,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing[3],
        paddingHorizontal: Spacing[4],
        alignItems: 'center',
    },
    buttonPrimaryText: {
        color: Colors.white,
        fontSize: FontSizes.base,
        fontWeight: '600',
    },
    buttonSecondary: {
        backgroundColor: Colors.neutral[100],
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing[2],
        paddingHorizontal: Spacing[3],
        alignItems: 'center',
    },
    buttonSecondaryText: {
        color: Colors.neutral[600],
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    buttonDanger: {
        backgroundColor: Colors.danger.light,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing[2],
        paddingHorizontal: Spacing[3],
        alignItems: 'center',
    },
    buttonDangerText: {
        color: Colors.danger.text,
        fontSize: FontSizes.sm,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },

    badge: {
        backgroundColor: Colors.primary.DEFAULT,
        borderRadius: 2,
        paddingHorizontal: Spacing[1.5],
        paddingVertical: 1,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
    },

    gradeBox: {
        width: 34,
        height: 34,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradeValue: {
        fontSize: FontSizes.sm,
        fontWeight: '700',
        color: Colors.white,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing[2],
    },
    statValue: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.neutral[800],
    },
    statLabel: {
        fontSize: FontSizes.xs,
        color: Colors.neutral[500],
        marginTop: Spacing[0.5],
    },

    progressContainer: {
        height: 8,
        backgroundColor: Colors.neutral[200],
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: BorderRadius.sm,
    },

    dayHeader: {
        fontSize: FontSizes.base,
        fontWeight: '700',
        color: Colors.neutral[800],
        paddingVertical: Spacing[2],
        paddingHorizontal: Spacing[3],
        backgroundColor: Colors.neutral[100],
        borderRadius: BorderRadius.sm,
        marginTop: Spacing[4],
        marginBottom: Spacing[2],
    },
    lessonCard: {
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.sm,
        padding: Spacing[3],
        marginBottom: Spacing[2],
        flexDirection: 'row',
    },
    lessonTime: {
        width: 56,
        marginRight: Spacing[3],
        alignItems: 'center',
    },
    lessonOrder: {
        fontSize: FontSizes.xs,
        color: Colors.neutral[400],
        marginBottom: Spacing[0.5],
    },

    dayButton: {
        paddingHorizontal: Spacing[2],
        paddingVertical: Spacing[2.5],
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.neutral[50],
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayButtonActive: {
        backgroundColor: Colors.primary.DEFAULT,
        borderColor: Colors.primary.DEFAULT,
    },
    dayButtonText: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.neutral[500],
        textAlign: 'center',
    },
    dayButtonTextActive: {
        color: Colors.white,
    },

    progressFill: {
        height: '100%',
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.primary.DEFAULT,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing[4],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral[100],
    },
    modalContent: {
        backgroundColor: Colors.light.card,
        borderRadius: BorderRadius.md,
        padding: Spacing[5],
        width: '100%',
        maxWidth: 400,
    },
    headerMedium: {
        fontSize: FontSizes.xl,
        fontWeight: '700',
        color: Colors.neutral[900],
    },
});
