#!/usr/bin/env python3

"""
Hunt for XSADD-style PRNGs with 32-bit x 4 state - EXHAUSTIVE SEARCH.

This script performs a comprehensive search for pseudorandom number generators that follow 
the XSADD pattern:
- 4 x 32-bit state variables (x, y, z, w)  
- State shift: x->y, y->z, z->w
- Three XOR operations on the old x value: t^=t<<A; t^=t>>B; t^=w<<C
- New w = t
- Output typically w + z (not tested here, just the state transition)

SEARCH SPACE:
- All 27 combinations of operations: shr(>>), shl(<<), rol(rotate left)  
- All shift amounts from 1 to 31 for each of the 3 operations
- Total: 27 × 31³ = 804,357 configurations

The original XSADD uses shifts of 15, 18, 11 with operations <<, >>, <<.
This exhaustive search finds ALL variants that achieve maximum period.
"""

import itertools
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor
from gf2 import XorshiftAnalyzer

bit_width = 32
state_size = 4

def test(op, r, config):
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

    # Computes the next state of our XSADD-style generator
    # Original XSADD: t=x; x=y; y=z; z=w; t^=t<<15; t^=t>>18; t^=w<<11; w=t; return w+z
    def next_state_func(s):
        # Save x (s[0]) before shifting state
        t = s[0]
        
        # Shift state: x->y, y->z, z->w  
        s[0] = s[1]  # x = y
        s[1] = s[2]  # y = z
        s[2] = s[3]  # z = w
        
        # Apply three XOR operations with configurable shift amounts and directions
        # This generalizes the XSADD pattern: t^=t<<A; t^=t>>B; t^=w<<C
        t = t ^ o(op[0], t, r[0])        # First XOR shift on t
        t = t ^ o(op[1], t, r[1])        # Second XOR shift on t  
        t = t ^ o(op[2], s[3], r[2])     # Third XOR shift involving w (new z value)
        
        # Set w = t
        s[3] = t
        
        return s

    result = a.check(next_state_func)
    return (result.period == a.max_period)

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)

    # For XSADD-style generators, we don't need complex permutations
    # Just test the basic algorithm structure
    def simple_configs():
        yield None  # Single configuration to test

    # Calculate total search space for progress reporting
    total_ops = 3**3  # 27 operation combinations
    total_shifts = 31**3  # 29,791 shift combinations per operation set
    total_tests = total_ops * total_shifts
    print(f"Total search space: {total_ops} operation combinations × {total_shifts} shift combinations = {total_tests:,} tests")

    # Use ProcessPoolExecutor for parallel execution
    MAX_IN_FLIGHT = 64
    test_count = 0
    found_count = 0
    
    with ProcessPoolExecutor(max_workers=mp.cpu_count()) as executor:
        # Search for XSADD-style patterns with 3 operations:
        # op[0]: first XOR shift on t, op[1]: second XOR shift on t, op[2]: XOR shift on w
        # Test all permutations of operations: 0=shr(>>), 1=shl(<<), 2=rol(rotate left)
        
        futures = []  # Track submitted tasks
        
        for op_idx, op in enumerate(itertools.product(range(0, 3), repeat=3)):
            print(f"Testing operation combination {op_idx + 1}/{total_ops}: {op}", flush=True)
            
            # Test full range of shift amounts for 32-bit operations
            # For 32-bit values, shifts of 0 and 32+ are trivial, so test 1-31
            for r1 in range(1, 32):         # First shift: full range
                for r2 in range(1, 32):     # Second shift: full range  
                    for r3 in range(1, 32): # Third shift: full range
                        r = (r1, r2, r3)
                        
                        # Submit task for parallel execution
                        config_iter = simple_configs()
                        for config in config_iter:
                            future = executor.submit(test, op, r, config)
                            futures.append((future, op, r, test_count))
                            test_count += 1
                            
                            # Limit number of tasks in flight
                            if len(futures) >= MAX_IN_FLIGHT:
                                # Process completed tasks
                                completed_futures = []
                                for fut, op_val, r_val, count in futures:
                                    if fut.done():
                                        ok = fut.result()
                                        if ok:
                                            found_count += 1
                                            print(f"★ FOUND #{found_count}: op={op_val}, r={r_val}: XSADD-style PRNG with full period!", flush=True)
                                        
                                        # Progress reporting every 1000 tests
                                        if count % 1000 == 0:
                                            progress = (count / total_tests) * 100
                                            print(f"Progress: {count:,}/{total_tests:,} ({progress:.1f}%) - Found: {found_count}", flush=True)
                                    else:
                                        completed_futures.append((fut, op_val, r_val, count))
                                futures = completed_futures
        
        # Process remaining futures
        for fut, op_val, r_val, count in futures:
            ok = fut.result()
            if ok:
                found_count += 1
                print(f"★ FOUND #{found_count}: op={op_val}, r={r_val}: XSADD-style PRNG with full period!", flush=True)
    
    print(f"\n=== SEARCH COMPLETE ===")
    print(f"Total tests: {test_count:,}")
    print(f"Full-period generators found: {found_count}")
    print(f"Success rate: {(found_count/test_count)*100:.3f}%" if test_count > 0 else "N/A")
