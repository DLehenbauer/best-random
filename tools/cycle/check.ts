import { checkPeriod } from "../utils";

const M = 362437;

const next = (a: number) => {
    return Math.imul(a, M);
}

let cycle = checkPeriod(next, M);

console.log(cycle.length.toString(16));