'use client';

import { useCallback, useEffect, useState } from "react";

const tagColors = [
    { bg: '#F3F4F6', text: '#1F2937' },
    { bg: '#FEE2E2', text: '#991B1B' },
    { bg: '#FEF3C7', text: '#92400E' },
    { bg: '#D1FAE5', text: '#065F46' },
    { bg: '#DBEAFE', text: '#1E40AF' },
    { bg: '#E0E7FF', text: '#3730A3' },
    { bg: '#EDE9FE', text: '#5B21B6' },
    { bg: '#FCE7F3', text: '#9D174D' }
];

const useColorGenerator = (name: string = 'M1000'): [string, string] => {
    const [colors, setColors] = useState<[string, string]>(['', '']);

    const generateColorIndex = useCallback((str: string): number => {
        let hash = 0;
        for(let i = 0; i < str.length; i++){
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % tagColors.length;
    }, []);

    const updateColor = useCallback(() => {
        const colorIndex = generateColorIndex(name);
        const { bg, text } = tagColors[colorIndex];
        setColors([bg, text]);
    }, [name, generateColorIndex]);

    useEffect(() => {
        updateColor();
    }, [updateColor]);

    return colors;
};

export default useColorGenerator;