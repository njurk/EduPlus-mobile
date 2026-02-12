import { childrenApi } from '@/services/api';
import type { MobileChild } from '@/types';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface StudentContextType {
    children: MobileChild[];
    selectedStudent: MobileChild | null;
    selectStudent: (id: number) => void;
    isLoading: boolean;
    hasMultipleChildren: boolean;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children: childrenNodes }: { children: ReactNode }) {
    const { user, isParent } = useAuth();
    const [childrenList, setChildrenList] = useState<MobileChild[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<MobileChild | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && isParent) {
            childrenApi.getAll().then(data => {
                setChildrenList(data);
                if (data.length > 0) setSelectedStudent(data[0]);
            }).catch(() => { }).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user, isParent]);

    const selectStudent = useCallback((id: number) => {
        const found = childrenList.find(c => c.id === id);
        if (found) setSelectedStudent(found);
    }, [childrenList]);

    return (
        <StudentContext.Provider value={{
            children: childrenList,
            selectedStudent,
            selectStudent,
            isLoading,
            hasMultipleChildren: childrenList.length > 1
        }}>
            {childrenNodes}
        </StudentContext.Provider>
    );
}

export function useStudent(): StudentContextType {
    const context = useContext(StudentContext);
    if (context === undefined) throw new Error('useStudent musi być wywołane w ramach StudentProvider');
    return context;
}
