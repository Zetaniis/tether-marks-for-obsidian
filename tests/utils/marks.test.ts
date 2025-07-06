import {
    findFirstUnusedRegister,
    getMarkBySign,
    sortMarksAlphabetically,
    getSortedAndFilteredMarks,
    sortMarksBySettingsRegisterOrder,
    removeGapsForHarpoonMarks
} from '../../src/utils/marks';
import { Mark, Settings } from '../../src/types/index';

describe('marks utils', () => {
    const marks: Mark[] = [
        { sign: 'A', filePath: 'fileA.md' },
        { sign: 'C', filePath: 'fileC.md' },
        { sign: 'B', filePath: 'fileB.md' },
        { sign: 'E', filePath: 'fileE.md' }
    ];

    describe('findFirstUnusedRegister', () => {
        it('returns the first unused register', () => {
            const registers = ['A', 'B', 'C', 'D', 'E'];
            expect(findFirstUnusedRegister(marks, registers)).toBe('D');
        });
        it('returns null if all registers are used', () => {
            const registers = ['A', 'B', 'C', 'E'];
            expect(findFirstUnusedRegister(marks, registers)).toBe(null);
        });
        // uncomment if the feature for case sensitivity/insensitivty is implemented
        // it('is case-insensitive', () => {
        //     const registers = ['a', 'b', 'c', 'd', 'e'];
        //     expect(findFirstUnusedRegister(marks, registers)).toBe('d');
        // });
    });

    describe('getMarkBySign', () => {
        it('finds a mark by sign', () => {
            expect(getMarkBySign(marks, 'E')?.filePath).toBe('fileE.md');
        });
        // uncomment if the feature for case sensitivity/insensitivty is implemented
        // it('finds a mark by sign (case-insensitive)', () => {
        //     expect(getMarkBySign(marks, 'a')?.filePath).toBe('fileA.md');
        //     expect(getMarkBySign(marks, 'E')?.filePath).toBe('fileE.md');
        // });
        it('returns undefined if not found', () => {
            expect(getMarkBySign(marks, 'Z')).toBeUndefined();
        });
    });

    describe('sortMarksAlphabetically', () => {
        it('sorts marks alphabetically by sign', () => {
            const arr = [...marks];
            sortMarksAlphabetically(arr);
            expect(arr.map(m => m.sign)).toEqual(['A', 'B', 'C', 'E']);
        });
    });

    describe('getSortedAndFilteredMarks', () => {
        const settings: Settings = {
            registerList: 'ABCDE',
            harpoonRegisterList: 'ABCDE',
            registerSortByList: true,
            harpoonRegisterSortByList: false,
            experimentalGoto: false
        };

        it('filters marks by available registers', () => {
            const ms = [
                { sign: 'A', filePath: 'fileA.md' },
                { sign: 'F', filePath: 'fileF.md' }
            ];
            const filtered = getSortedAndFilteredMarks(ms, false, settings);
            expect(filtered.length).toBe(1);
            expect(filtered[0].sign).toBe('A');
        });

        it('sorts by register order if registerSortByList is true', () => {
            const ms = [
                { sign: 'C', filePath: 'fileC.md' },
                { sign: 'A', filePath: 'fileA.md' },
                { sign: 'B', filePath: 'fileB.md' }
            ];
            const sorted = getSortedAndFilteredMarks(ms, false, settings);
            expect(sorted.map(m => m.sign)).toEqual(['A', 'B', 'C']);
        });

        it('sorts alphabetically if registerSortByList is false', () => {
            const ms = [
                { sign: 'C', filePath: 'fileC.md' },
                { sign: 'A', filePath: 'fileA.md' },
                { sign: 'B', filePath: 'fileB.md' }
            ];
            const customSettings = { ...settings, registerSortByList: false };
            const sorted = getSortedAndFilteredMarks(ms, false, customSettings);
            expect(sorted.map(m => m.sign)).toEqual(['A', 'B', 'C']);
        });
    });

    describe('sortMarksBySettingsRegisterOrder', () => {
        it('sorts marks by custom register order', () => {
            const arr = [
                { sign: 'C', filePath: 'fileC.md' },
                { sign: 'A', filePath: 'fileA.md' },
                { sign: 'B', filePath: 'fileB.md' }
            ];
            sortMarksBySettingsRegisterOrder(arr, 'BAC');
            expect(arr.map(m => m.sign)).toEqual(['B', 'A', 'C']);
        });
    });

    describe('removeGapsForHarpoonMarks', () => {
        it('removes gaps and reorders marks according to harpoonRegisters', () => {
            const ms = [
                { sign: 'A', filePath: 'fileA.md' },
                { sign: 'C', filePath: 'fileC.md' },
                { sign: 'E', filePath: 'fileE.md' }
            ];
            const harpoonRegisters = ['A', 'B', 'C', 'D', 'E'];
            const result = removeGapsForHarpoonMarks(ms, harpoonRegisters);
            // Should fill A, B, C with the first three marks, and remove D, E if not present
            expect(result.map(m => m.sign)).toEqual(['A', 'B', 'C']);
            expect(result[0].filePath).toBe('fileA.md');
            expect(result[1].filePath).toBe('fileC.md');
            expect(result[2].filePath).toBe('fileE.md');
        })})
});