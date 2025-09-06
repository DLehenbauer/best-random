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

        s[0] = a.shl(si0, c[0]) ^ a.shr(si1, c[1])
        s[1] = a.shl(si2, c[2]) ^ a.shr(si3, c[3])

        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)
    start = time.time()
    for i in itertools.product(range(2), repeat=4):
        for c in itertools.product(range(bit_width), repeat=4):
            if test(i, c):
                print(f"{i}{c}: OK", flush=True)
    elapsed = time.time() - start
    print(f"--- END: (elapsed: {elapsed:.2f} seconds)", flush=True)
