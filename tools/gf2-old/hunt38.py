#!/usr/bin/env python3

from gf2 import XorshiftAnalyzer

bit_width = 64
state_size = 2

def test(c0: int):
    a = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)

    def next_state_func(s):
        s0 = s[0]
        s1 = s[1]

        s[0] ^= a.shr(s1, c0)
        s[1] ^= s0

        return s

    result = a.check(next_state_func)

    return (result.period == a.max_period)

if __name__ == "__main__":
    for c0 in range(0, bit_width):
        if (test(c0)):
            print(f"({c0}): OK")

    print("--- done ---")
