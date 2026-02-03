import { cmsApi } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export function useCMSContent(pageLabel: string) {
    const [content, setContent] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cmsApi.getPublicContent(pageLabel)
            .then(setContent)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [pageLabel]);

    const getText = useCallback((key: string, fallback?: string) => {
        return content[key] ?? fallback ?? '';
    }, [content]);

    return { getText, loading, content };
}
