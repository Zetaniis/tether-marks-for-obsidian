import { Settings } from '../types/index';
import { Mark } from '../types/index';

export function findFirstUnusedRegister(marks: Mark[], harpoonRegisters: string[]): string | null {
    for (const reg of harpoonRegisters) {
        // if register not used already, then use it
        // console.log('Checking register:', reg);
        if (!(marks.map(m => m.sign.toLowerCase()).contains(reg.toLowerCase()))) {
            return reg;
        }
    }
    return null;
}

export function sortMarksAlphabetically(marks: Mark[]) {
    marks.sort((a, b) => a.sign.localeCompare(b.sign))
}

export function getSortedAndFilteredMarks(marks: Mark[], isHarpoonMode: boolean, settings: Settings): Mark[] {
    const availableRegisters = new Set((!isHarpoonMode ? settings.registerList : settings.harpoonRegisterList).split(''));
    const filteredMarks: Mark[] = marks.filter(el => availableRegisters.has(el.sign.toLowerCase()));
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

export function sortMarksBySettingsRegisterOrder(marks: Mark[], registers: string | string[]) {
    const registerOrder = new Map([...registers].map((letter, index) => [letter.toLowerCase(), index]));
    marks.sort((a, b) => (registerOrder.get(a.sign.toLowerCase()) ?? Infinity) - (registerOrder.get(b.sign.toLowerCase()) ?? Infinity));
}

export function removeGapsForHarpoonMarks(marksToCopy: Mark[], harpoonRegisters: string[]): Mark[] {
    let marks = [...marksToCopy];

    let leftCur = 0;
    let rightCur = 0;

    while (rightCur < harpoonRegisters.length) {
        const markEl = marks.find(el => el.sign === harpoonRegisters[rightCur].toUpperCase());

        if (markEl !== undefined) {
            const signToSetTo = harpoonRegisters[leftCur].toUpperCase();
            let filteredMarks = marks.filter(el => el.sign !== harpoonRegisters[leftCur].toUpperCase());
            filteredMarks.push({ sign: signToSetTo, filePath: markEl.filePath })
            marks = filteredMarks;
            leftCur += 1;
        }
        rightCur += 1;
    }

    while (leftCur < harpoonRegisters.length) {
        marks = marks.filter(el => el.sign !== harpoonRegisters[leftCur].toUpperCase());
        leftCur += 1;
    }

    return marks;
}