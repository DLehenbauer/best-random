import { run, setConstants, score, mix } from "./common";
import { Ms, Ss } from "../utils";

interface IPermutation { M: number, S: number, C1: number, C2: number };

const permutations = [];
for (const M of Ms) {
    for (const S of Ss) {
        for (let C1 = 0; C1 <= 31; C1++) {
            for (let C2 = 0; C2 <= 0; C2++) {
                permutations.push({ M, S, C1, C2 });
            }
        }
    }
}

const hi = (_x: number, _y: number, _z: number, _w: number, _s: number) => mix(_w + _s, _y, _z);
const lo = (_x: number, _y: number, _z: number, _w: number, _s: number) => mix(_x + _s, _z, _y);

run(1 << 17, permutations, (permutation: IPermutation) => {
    setConstants(permutation);
    const s0 = score(hi);
    const s1 = score(lo);
    return Math.sqrt(s0 * s0 + s1 * s1);
}, ({ M, S, C1, C2 }: IPermutation) => {
    const hex = (value: number) => `0x${value.toString(16).padStart(8, "0")}`;
    return `M=${hex(M)},S=${hex(S)},C1=${C1},C2=${C2}`;
});
