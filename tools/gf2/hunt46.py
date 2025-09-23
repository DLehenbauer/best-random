#!/usr/bin/env python3

from gf2 import XorshiftAnalyzer

bit_width = 64
state_size = 2
num_consts = 3

import itertools
import time

def test(c):
    a = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)

    # Computes the next state of our Xorshift generator
    def next_state_func(s):
        c0, c1, c2 = c
        s0 = s[0]
        s1 = s[1]

        s0 ^= a.shl(s0, c0)
        s0 ^= a.shr(s0, c1)
        s0 ^= s1 ^ a.shr(s1, c2)

        s[0] = s1
        s[1] = s0

        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size}, num_consts={num_consts})", flush=True)
    start = time.time()
    for c in itertools.product(range(bit_width), repeat=num_consts):
        if test(c):
            print(f"{c}: OK", flush=True)
    elapsed = time.time() - start
    print(f"--- END: (elapsed: {elapsed:.2f} seconds)", flush=True)
