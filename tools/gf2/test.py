#!/usr/bin/env python3
"""
Test script to verify FLINT integration and performance
"""

import sys
import time
import numpy as np
from gf2 import XorshiftAnalyzer

def benchmark_performance():
    def xorshift_8bit(state):
        """8-bit xorshift for performance testing"""
        x = state[0]
        x ^= (x << 1) & 0xFF
        x ^= (x >> 1) & 0xFF
        x ^= (x << 2) & 0xFF
        return [x & 0xFF]
    
    # Test with 8-bit state (8x8 matrix)
    print("Running XorShift analyzer...")
    start_time = time.time()
    analyzer = XorshiftAnalyzer(state_size=1, bit_width=8)
    result = analyzer.check(xorshift_8bit)
    elapsed = time.time() - start_time
    
    print(f"Analysis elapsed: {elapsed:.3f} seconds")
    print(f"Theoretical period: {result.period}")
    print(f"Is primitive: {result.is_primitive}")
    
    # Now do brute force period check
    print("\nStarting brute force period verification...")
    brute_force_period = check_period(xorshift_8bit, initial_state=[1])
    
    print(f"\nResults comparison:")
    print(f"  Theoretical period: {result.period}")
    print(f"  Brute force period: {brute_force_period}")
    print(f"  Match: {result.period == brute_force_period}")

def check_period(next_state_func, initial_state, max_iterations=None):
    """
    Check the actual period of a PRNG by brute force iteration.
    
    Args:
        next_state_func: Function that takes current state and returns next state
        initial_state: Starting state for the period check
        max_iterations: Maximum number of iterations before giving up (default: 2^20)
        
    Returns:
        The actual period found, or -1 if not found within max_iterations
    """
    if max_iterations is None:
        max_iterations = 1 << 20  # 1 million iterations max
    
    # Use the provided initial state
    current_state = initial_state.copy()
    
    print(f"  Starting brute force with initial state: {initial_state}")
    print(f"  Maximum iterations: {max_iterations}")
    
    start_time = time.time()
    
    for iteration in range(1, max_iterations + 1):
        # Apply the next state function
        current_state = next_state_func(current_state)
        
        # Check if we've returned to initial state
        if current_state == initial_state:
            elapsed = time.time() - start_time
            print(f"  ✓ Period found: {iteration} (took {elapsed:.3f} seconds)")
            return iteration
        
        # Progress reporting for long computations
        if iteration % 10000 == 0:
            elapsed = time.time() - start_time
            print(f"    Progress: {iteration:,} iterations ({elapsed:.1f}s)")
    
    elapsed = time.time() - start_time
    print(f"  ⚠ Period not found within {max_iterations:,} iterations ({elapsed:.3f}s)")
    return -1

if __name__ == "__main__":
    benchmark_performance()
    sys.exit(1)
