#!/usr/bin/env python3

from gf2 import XorshiftAnalyzer

bit_width = 64
state_size = 2

import itertools
import time

def test(i, c):
    a = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)

    # Computes the next state of our Xorshift generator
    def next_state_func(s):
        si0 = s[i[0]]
        si1 = s[i[1]]
        si2 = s[i[2]]
        si3 = s[i[3]]

        c0 = c[0]
        c1 = c[1]
        c2 = c[2]
        c3 = c[3]

        s[0] = a.shl(si0, c0) ^ a.shr(si1, c1)
        s[1] = a.shl(si2, c2) ^ a.shr(si3, c3)

        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)
    start = time.time()
    for i in itertools.product(range(2), repeat=4):
        print(f"Checkpoint @ {i}", flush=True)
        if (i[0] == i[1] == i[2] == i[3]):
            print(f"Skipping {i} due to using only 64b of state.", flush=True)
            continue
        for c in itertools.product(range(bit_width), repeat=4):
            if (c[0] == 0 and c[2] == 0) or (c[1] == 0 and c[3] == 0):
                print(f"Skipping {i}{c} due to exclusive left or right shifts.", flush=True)
                continue
            if test(i, c):
                print(f"{i}{c}: OK", flush=True)
    elapsed = time.time() - start
    print(f"--- END: (elapsed: {elapsed:.2f} seconds)", flush=True)
