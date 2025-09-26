#!/usr/bin/env python3

import itertools
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor
from gf2 import XorshiftAnalyzer

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

    # SIMD-like operation on two 64-bit lanes (tuple of two ints)
    def o_simd(code, values, shift_amount):
        """
        Perform a SIMD operation (SHR or SHL) on two 64-bit lanes using the scalar o function.
        Args:
            code: operation code (0=shr, 1=shl)
            values: tuple of two 64-bit ints (lane0, lane1)
            shift_amount: integer shift amount (same for both lanes)
        Returns:
            tuple of two results (lane0, lane1)
        """
        return (o(code, values[0], shift_amount), o(code, values[1], shift_amount))

    # Given a pair of 64-bit integers like (0x0123456789ABCDEF, 0xFEDCBA9876543210),
    # convert to a 16-element array of bytes:
    def u64x2_to_u8x16(v):
        """
        Reinterpret a pair of unsigned 64-bit integers as 16 bytes (little-endian per lane).
        v: tuple (lo, hi) where each fits in 0..2**64-1
        Returns: list of 16 ints (0..255):
            bytes[0:8]  = little-endian bytes of v[0]
            bytes[8:16] = little-endian bytes of v[1]
        """
        return [(v[0] >> (8 * i)) & 0xFF for i in range(8)] + [(v[1] >> (8 * i)) & 0xFF for i in range(8)]

    def u64x2_to_u16x8(v):
        """
        Reinterpret a pair of unsigned 64-bit integers as 8 uint16 (little-endian per lane).
        v: tuple (lo, hi) where each fits in 0..2**64-1
        Returns: list of 8 ints (0..65535):
            u16[0:4] = little-endian uint16 of v[0]
            u16[4:8] = little-endian uint16 of v[1]
        """
        return [(v[0] >> (16 * i)) & 0xFFFF for i in range(4)] + [(v[1] >> (16 * i)) & 0xFFFF for i in range(4)]

    def u8x16_to_u64x2(b):
        """
        Reinterpret a 16-element array of bytes as a pair of unsigned 64-bit integers (little-endian per lane).
        b: list of 16 ints (0..255)
        Returns: tuple (lo, hi) where each fits in 0..2**64-1
            lo = little-endian bytes b[0:8]
            hi = little-endian bytes b[8:16]
        """
        if len(b) != 16:
            raise ValueError("Input list must have exactly 16 elements.")
        lo = sum(b[i] << (8 * i) for i in range(8))
        hi = sum(b[i + 8] << (8 * i) for i in range(8))
        return (lo, hi)
    
    def u16x8_to_u64x2(u):
        """
        Reinterpret an 8-element array of uint16 as a pair of unsigned 64-bit integers (little-endian per lane).
        u: list of 8 ints (0..65535)
        Returns: tuple (lo, hi) where each fits in 0..2**64-1
            lo = little-endian uint16 u[0:4]
            hi = little-endian uint16 u[4:8]
        """
        if len(u) != 8:
            raise ValueError("Input list must have exactly 8 elements.")
        lo = sum(u[i] << (16 * i) for i in range(4))
        hi = sum(u[i + 4] << (16 * i) for i in range(4))
        return (lo, hi)

    def u8x16_swizzle(a, s):
        """
        Swizzle a 16-element array based on a 16-element selector array.
        Each selector value in range 0..15 selects from `a`.
        """
        result = [0] * 16
        for i in range(16):
            result[i] = a[s[i]]
        return result

    def u16x8_swizzle(a, s):
        """
        Swizzle an 8-element array of uint16 based on an 8-element selector array.
        Each selector value in range 0..7 selects from `a`.
        """
        result = [0] * 8
        for i in range(8):
            result[i] = a[s[i]]
        return result

    # Computes the next state of our Xorshift generator
    def next_state_func(s):
        x = o_simd(op, s, r)
        y = u16x8_to_u64x2(u16x8_swizzle(u64x2_to_u16x8(s), c))

        s[0] ^= x[0] ^ y[0]
        s[1] ^= x[1] ^ y[1]

        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)
    
    # Get all permutations to test
    all_permutations = list(itertools.permutations(range(0, 8)))
    
    # Filter out permutations where any element is in its original position
    # (i.e., skip permutations where value i is at index i for any i)
    permutations = [p for p in all_permutations if not any(p[i] == i for i in range(8))]
    
    total_perms = len(permutations)
    filtered_count = len(all_permutations) - total_perms
    print(f"Filtered out {filtered_count} permutations with identity elements", flush=True)
    print(f"Testing {total_perms} permutations using parallel processing...", flush=True)
    
    # Use ProcessPoolExecutor for parallel execution
    with ProcessPoolExecutor(max_workers=mp.cpu_count()) as executor:
        # All valid values of op are 0 and 1
        for op in range(2):
            for r in range(1, bit_width):
                # Submit all tasks
                future_to_perm = {executor.submit(test, op, r, c): c for c in permutations}

                # Process results as they complete
                completed = 0
                for future in future_to_perm:
                    c = future_to_perm[future]
                    ok = future.result()
                    if ok:
                        print(f"op={op}, r={r}, c={c}: OK", flush=True)                        
                    completed += 1
                    if (completed % 1000) == 0 or completed == total_perms:
                        print(f"Checkpoint @ op={op}, r={r}, c={c}", flush=True)
