#!/usr/bin/env python3

from gf2 import XorshiftAnalyzer

bit_width = 32
state_size = 4

import itertools
import time

def test(c):
    a = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)

    # XSAdd
    def next_state_func(s):
        sh1 = c[0]
        sh2 = c[1]
        sh3 = c[2]

        t = s[0]
        t ^= a.shl(t, sh1)
        t ^= a.shr(t, sh2)
        t ^= a.shl(s[3], sh3)
        s[0] = s[1]
        s[1] = s[2]
        s[2] = s[3]
        s[3] = t

        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)
    start = time.time()
    for c in itertools.product(range(bit_width), repeat=3):
        if test(c):
            print(f"{c}: OK", flush=True)
    elapsed = time.time() - start
    print(f"--- END: (elapsed: {elapsed:.2f} seconds)", flush=True)
