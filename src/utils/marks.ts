import { Settings } from '../types/index';
import { Mark } from '../types/index';

export function findFirstUnusedRegister(marks: { letter: string }[], harpoonRegisters: string[]): string | null {
    for (const reg of harpoonRegisters) {
        // if register not used already, then use it
        // console.log('Checking register:', reg);
        if (!(marks.map(m => m.letter.toLowerCase()).contains(reg.toLowerCase()))) {
            return reg;
        }
    }
    return null;
}

export function sortMarksAlphabetically(marks: Mark[]) {
    marks.sort((a, b) => a.letter.localeCompare(b.letter))
}

export function getSortedAndFilteredMarks(marks: Mark[], isHarpoonMode : boolean, settings: Settings) : Mark[] {
    const availableRegisters = new Set((!isHarpoonMode ? settings.registerList : settings.harpoonRegisterList).split(''));
    const filteredMarks : Mark[] = marks.filter(el => availableRegisters.has(el.letter.toLowerCase()));
    if (!isHarpoonMode && settings.registerSortByList) {
        // Sort marks by the order of the letters in the register list
        const registerList = settings.registerList;
        sortMarksBySettingsRegisterOrder(filteredMarks, registerList);
    }
    else if (isHarpoonMode && settings.harpoonRegisterSortByList) {
        // Sort marks by the order of the letters in the harpoon register list
        const registerList = settings.harpoonRegisterList;
        sortMarksBySettingsRegisterOrder(filteredMarks, registerList);
    }
    else {
        sortMarksAlphabetically(filteredMarks);
    }
    return filteredMarks;
}

export function sortMarksBySettingsRegisterOrder(marks: Mark[], registers: string|string[]) {
        const registerOrder = new Map([...registers].map((letter, index) => [letter.toLowerCase(), index]));
        marks.sort((a, b) => (registerOrder.get(a.letter.toLowerCase()) ?? Infinity) - (registerOrder.get(b.letter.toLowerCase()) ?? Infinity));
}
