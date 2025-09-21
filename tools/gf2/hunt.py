#!/usr/bin/env python3

from gf2 import XorshiftAnalyzer

bit_width = 64
state_size = 2

import time
import sys

def test(i, ops, c):
    a = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)

    # Helper to perform an operation chosen by integer code:
    # 0 -> right shift (shr), 1 -> left shift (shl), 2 -> rotate left (rol)
    def o(code, value, shift_amount):
        if code == 0:
            return a.shr(value, shift_amount)
        elif code == 1:
            return a.shl(value, shift_amount)
        elif code == 2:
            return a.rol(value, shift_amount)
        else:
            raise ValueError(f"Invalid operation code: {code}")

    # Computes the next state of our Xorshift generator
    def next_state_func(s):
        si0 = s[i[0]]
        si1 = s[i[1]]
        si2 = s[i[2]]
        si3 = s[i[3]]

        o0 = ops[0]
        o1 = ops[1]

        c0 = c[0]
        c1 = c[1]

        s[0] = si0 ^ o(o0, si1, c0)
        s[1] = si2 ^ o(o1, si3, c1)

        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    #print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)
    start = time.time()

    # Expect exactly 8 integer command-line arguments: 4 for `i`, 2 for `ops`,
    # and 2 for `c` (shift amounts).
    if len(sys.argv) != 9:
        print("Usage: hunt.py i0 i1 i2 i3 op0 op1 c0 c1", file=sys.stderr)
        print(f"i values must be 0 or 1, op values must be 0..2.\n"
              f"c values: for RSH (op=0) allowed range is 0..{bit_width};\n"
              f"for other ops allowed range is 1..{bit_width-1}.", file=sys.stderr)
        sys.exit(2)

    try:
        args = [int(x, 0) for x in sys.argv[1:9]]  # allow decimal/hex input
    except ValueError:
        print("All arguments must be integers.", file=sys.stderr)
        sys.exit(2)

    i = tuple(args[0:4])
    ops = tuple(args[4:6])
    c = tuple(args[6:8])

    if any(x not in (0, 1) for x in i):
        print("Error: all i values must be 0 or 1.", file=sys.stderr)
        sys.exit(2)

    if any(not (0 <= x <= 2) for x in ops):
        print("Error: all op values must be in range 0..2.", file=sys.stderr)
        sys.exit(2)

    if any(not (1 <= x < bit_width) for x in c):
        print(f"Error: all c values must be in range 1..{bit_width-1}.", file=sys.stderr)
        sys.exit(2)

    ok = test(i, ops, c)
    status = "OK" if ok else "NOT OK"
    print(f"i={i} ops={ops} c={c}: {status}", flush=True)

    elapsed = time.time() - start
    #print(f"--- END: (elapsed: {elapsed:.2f} seconds)", flush=True)
