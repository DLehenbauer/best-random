#!/usr/bin/env python3

import sys
import time
from itertools import product
from gf2 import XorshiftAnalyzer

a = XorshiftAnalyzer(state_size=1, bit_width=8)
elapsed_time = 0.0
mask = (1 << a.bit_width) - 1

def test(c0: int, c1: int, c2: int):
    global elapsed_time

    def next_state_func_core(t):
        t ^= t >> c0
        t ^= (t << c1) & mask
        t ^= t >> c2
        return t

    def next_state_func(s):
        s[0] = next_state_func_core(s[0])
        return s
    
    def check_period():
        # Use the provided initial state
        t = 1
        start = t
        
        for iteration in range(1, a.max_period + 1):
            # Apply the next state function
            t = next_state_func_core(t)
            
            # Check if we've returned to initial state
            if t == start:
                return iteration
            
        return -1

    start_time = time.time()
    result = a.check(next_state_func)
    end_time = time.time()
    elapsed_time += (end_time - start_time)
    
    actual_period = check_period()
    
    if (result == a.max_period):
        assert result == actual_period, f"Theoretical period {result} does not match actual period {actual_period}."
        return True
    else:
        assert actual_period < a.max_period, f"Actual period {actual_period} should be less than max period {a.max_period}."
        assert result == -1 or result >= actual_period, f"Theoretical period {result} should be at least the actual period found {actual_period}."
        return False

def run():
    total_tests = 0
    passed_tests = 0
    
    for c0, c1, c2 in product(range(1, a.bit_width), repeat=3):
        total_tests += 1
        if (test(c0, c1, c2)):
            passed_tests += 1
            print(f"({c0}, {c1}, {c2}): OK")
    
    print(f"\n{'='*60}")
    print(f"Test Results:")
    print(f"  Total tests: {total_tests}")
    print(f"  OK: {passed_tests}")
    print(f"  Elapsed time: {elapsed_time:.2f} seconds")
    print(f"  Average time per test: {elapsed_time/total_tests*1000:.2f} ms")
    print(f"{'='*60}")

if __name__ == "__main__":
    run()
