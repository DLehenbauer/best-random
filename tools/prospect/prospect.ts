import { strict as assert } from "assert";
import { setConstants, MixFn, run, score, mix as mixFn } from './common';

const mix = mixFn;

assert(mix);

const M=0x01ed0675,S=0x01ed0675,C1=17,C2=0;
setConstants({ M, S, C1, C2 });

const forEachParam = (exclusions: number[], callback: (p: string, exclusions: number[]) => void) => {
    const params = ['x', 'y', 'z', 'w'];

    for (let i = 0; i < params.length; i++) {
        if (exclusions.includes(i)) { continue };
        exclusions.push(i);

        const param = params[i];
        
        callback(`${param}`, exclusions);
        callback(`-${param}`, exclusions);
        callback(`s - ${param}`, exclusions);
        callback(`s + ${param}`, exclusions);
        callback(`${param} - s`, exclusions);

        exclusions.pop();
    }
}

const mixFns: MixFn[] = [];

forEachParam([], (p1, e1) => {
    forEachParam(e1, (p2, e2) => {
        forEachParam(e2, (p3) => {
            mixFns.push(eval(`(x, y, z, w, s) => mix(${p1}, ${p2}, ${p3})`));
        })                
    })
});

const permutations: { mixFn: MixFn }[] = [];
for (let i = 0; i < mixFns.length; i++) {
    permutations.push(Object.freeze({ mixFn: mixFns[i] }));
}

const reverse = (mixFn: MixFn) => 
    (x: number, y: number, z: number, w: number, s: number) => {
        let v = mixFn(x, y, z, w, s);

        v = ((v >>> 1) & 0x55555555) | ((v & 0x55555555) << 1);
        v = ((v >>> 2) & 0x33333333) | ((v & 0x33333333) << 2);
        v = ((v >>> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
        v = ((v >>> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
        v = ( v >>> 16             ) | ( v               << 16);
    
        return v;    
    };

run(1 << 18, permutations, (permutation) => {
    const { mixFn } = permutation;
    const s0 = score(mixFn);
    const s1 = score(reverse(mixFn));
    return Math.sqrt(s0 * s0 + s1 * s1);
}, ({mixFn}) => {
    const re1 = /(mix\([^,]+,\s*[^,]+,\s*.+)/;
    return `${mixFn.toString().match(re1)![1]}`;
});
