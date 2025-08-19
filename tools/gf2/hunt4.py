#!/usr/bin/env python3

from gf2 import XorshiftAnalyzer

bit_width = 32
state_size = 2

def test(c0: int, c1: int, c2: int):
    a = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)

    def next_state_func(s):
        t = s[0]
        t ^= a.shl(t, c0)
        t ^= a.shr(t, c1)
        t ^= a.shl(s[1], c2)
        
        s[0] = s[1]
        s[1] = t

        return s

    result = a.check(next_state_func)

    return (result.period == a.max_period)

if __name__ == "__main__":
    for c0 in range(0, bit_width):
        for c1 in range(0, bit_width):
            for c2 in range(0, bit_width):
                if (test(c0, c1, c2)):
                    print(f"({c0}, {c1}, {c2}): OK")
