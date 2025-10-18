#!/usr/bin/env python3

import itertools
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor
from gf2 import XorshiftAnalyzer
import simd

bit_width = 64
state_size = 2

def test(op, r, c):
    a = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)

    # Helper to perform an operation chosen by integer code:
    #   0: shr (>>)
    #   1: shl (<<)
    #   2: rol (rotate left)
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
        x = simd.o_simd(o, op[0], s, r[0])
        y = simd.u8x16_to_u64x2(simd.u8x16_shuffle(simd.u64x2_to_u8x16(s), c))

        s[0] = x[0] ^ y[0]
        s[1] = x[1] ^ y[1]

        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)

    def derangements(n):
        for p in itertools.permutations(range(n)):
            if all(p[i] != i for i in range(n)):
                yield p

    half_perms = list(derangements(8))   # sources for dest positions 8..15 (original low half)

    MIN_TOTAL_DISPLACEMENT = 100  # Require total |i - p[i]| over 16 bytes to exceed this before yielding

    def calc_displacement(c):
        total = 0
        for i in range(0, len(c)):
            src = i
            dest = c.index(i)
            delta = abs(src - dest)
            total += delta
        return total

    def half_swap_permutations():
        yield [14, 1, 15, 0, 13, 2, 12, 3, 11, 4, 10, 5, 9, 6, 8, 7]
        # Iterate two 8-derangements to build a 16-byte half-swapping permutation.
        # for hp in half_perms:          # contributes to dest positions 0..7 (sources 8..15)
        #     for lp in half_perms:      # contributes to dest positions 8..15 (sources 0..7)
        #         combined = tuple(8 + hp[i] for i in range(8)) + tuple(lp[i] for i in range(8))
        #         yield combined

    # Use ProcessPoolExecutor for parallel execution
    MAX_IN_FLIGHT = 64
    with ProcessPoolExecutor(max_workers=mp.cpu_count()) as executor:
        for op in itertools.product(range(0, 2), repeat=1):
            for r in itertools.product(range(1, bit_width), repeat=1):
                completed = 0
                perm_iter = half_swap_permutations()
                futures = []  # list of (future, permutation)

                # Prime the queue with up to MAX_IN_FLIGHT tasks
                for _ in range(MAX_IN_FLIGHT):
                    try:
                        c = next(perm_iter)
                    except StopIteration:
                        break
                    futures.append((executor.submit(test, op, r, c), c))

                # Process in a rolling fashion: when one finishes, submit next
                while futures:
                    fut, c_val = futures.pop(0)
                    ok = fut.result()
                    completed += 1
                    if ok:
                        print(f"op={op}, r={r}, c={c_val}: OK", flush=True)
                    print(f"Checkpoint @ op={op}, r={r}, c={c_val}, processed={completed}", flush=True)

                    # Refill slot if more permutations remain
                    try:
                        c_next = next(perm_iter)
                        futures.append((executor.submit(test, op, r, c_next), c_next))
                    except StopIteration:
                        pass
