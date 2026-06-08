import { Mark } from "tether-marks-core";

export const compareMarkArraysWithOrder = (leftArr : Mark[], rightArr : Mark[]): boolean  => {
    if (rightArr.length !== leftArr.length) return false;
    for (let i = 0; i < leftArr.length; i++) {
        if (leftArr[i].filePath != rightArr[i].filePath || leftArr[i].symbol != rightArr[i].symbol) {
            return false;
        }
    }
    return true;
}