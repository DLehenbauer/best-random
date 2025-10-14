#!/usr/bin/env python3

from gf2 import XorshiftAnalyzer

bit_width = 64
state_size = 2

import time
import sys

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

    # Expect exactly 8 integer command-line arguments: 4 for `i`, then 4 for `c`.
    if len(sys.argv) != 9:
        print("Usage: hunt0.py i0 i1 i2 i3 c0 c1 c2 c3", file=sys.stderr)
        print("Each `i` must be 0 or 1. Each `c` must be in range 0..{0}.".format(bit_width-1), file=sys.stderr)
        sys.exit(2)

    try:
        args = [int(x, 0) for x in sys.argv[1:9]]  # allow decimal/hex input
    except ValueError:
        print("All arguments must be integers.", file=sys.stderr)
        sys.exit(2)

    i = tuple(args[0:4])
    c = tuple(args[4:8])

    if any(x not in (0, 1) for x in i):
        print("Error: all i values must be 0 or 1.", file=sys.stderr)
        sys.exit(2)

    if any(not (0 <= x < bit_width) for x in c):
        print(f"Error: all c values must be in range 0..{bit_width-1}.", file=sys.stderr)
        sys.exit(2)

    ok = test(i, c)
    status = "OK" if ok else "NOT OK"
    print(f"i={i} c={c}: {status}", flush=True)

    elapsed = time.time() - start
    print(f"--- END: (elapsed: {elapsed:.2f} seconds)", flush=True)
