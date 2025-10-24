#!/usr/bin/env python3

"""
Hunt for linear-GF2 PRNGs with maximal period.
"""

import itertools
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor
from gf2 import XorshiftAnalyzer

bit_width = 32
state_size = 3

def is_valid_combination(a, b):
    """
    Check if a combination of 'a' and 'b' indices could produce a maximal period generator.
    
    Rules:
    1. Each state variable s[i] must receive feedback from at least one other state variable
       (i.e., if a[i] == i, then b[i] must != i)
    2. All state variables must be reachable (i.e., all indices 0, 1, 2 must appear in 'a' or 'b')
    """
    # Rule 1: Check that each output position receives feedback from other state variables
    for i in range(state_size):
        if a[i] == i and b[i] == i:
            # s[i] = s[i] ^ op(s[i], shift) - only self-feedback, invalid
            return False
    
    # Rule 2: Check that all state variables are used (reachable)
    all_indices = set(a) | set(b)
    if all_indices != set(range(state_size)):
        # Not all state variables are used, so some are unreachable
        return False
    
    return True

def is_valid_op_combination(op):
    """
    Check if an operation combination could produce a maximal period generator.
    
    Rules:
    1. Cannot have all operations be the same non-rotate shift:
       - All right shifts (>>): MSBs never receive feedback from LSBs
       - All left shifts (<<): LSBs never receive feedback from MSBs
    2. All rotates might work, so we allow that case
    """
    # Check if all operations are the same
    if len(set(op)) == 1:
        op_type = op[0]
        # 0 = shr (>>), 1 = shl (<<), 2 = rol (rotate)
        if op_type == 0 or op_type == 1:
            # All right shifts or all left shifts - bits will be stuck
            return False
    
    return True

# Create analyzer lazily per-process to avoid pickling issues
_analyzer = None

def get_analyzer():
    global _analyzer
    if _analyzer is None:
        _analyzer = XorshiftAnalyzer(state_size=state_size, bit_width=bit_width)
    return _analyzer

def test(op, a, b, r):
    analyzer = get_analyzer()
    
    # Helper to perform an operation chosen by integer code:
    #   0: shr (>>)
    #   1: shl (<<)
    #   2: rol (rotate left)
    def o(code, value, shift_amount):
        if code == 0:
            return analyzer.shr(value, shift_amount)
        elif code == 1:
            return analyzer.shl(value, shift_amount)
        elif code == 2:
            return analyzer.rol(value, shift_amount)
        else:
            raise ValueError(f"Invalid operation code: {code}")

    # Computes the next state
    def next_state_func(s):
        a0, a1, a2 = s[a[0]], s[a[1]], s[a[2]]
        b0, b1, b2 = s[b[0]], s[b[1]], s[b[2]]

        s[0] = a0 ^ o(op[0], b0, r[0])
        s[1] = a1 ^ o(op[1], b1, r[1])
        s[2] = a2 ^ o(op[2], b2, r[2])
        return s

    result = analyzer.check(next_state_func)
    return result == analyzer.max_period

if __name__ == "__main__":
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)

    # Calculate total search space for progress reporting
    num_op_kinds = 3
    num_ops = 3
    op_arg_start = 1
    op_arg_end = 33
    num_op_arg_values = op_arg_end - op_arg_start

    # Generate all valid (a, b) combinations
    all_ab_combos = []
    all_possible_ab = list(itertools.product(
        itertools.product(range(state_size), repeat=state_size),  # all 'a' combinations
        itertools.product(range(state_size), repeat=state_size)   # all 'b' combinations
    ))
    
    for a_indices, b_indices in all_possible_ab:
        if is_valid_combination(a_indices, b_indices):
            all_ab_combos.append((a_indices, b_indices))
    
    print(f"Valid (a, b) combinations: {len(all_ab_combos)} out of {len(all_possible_ab)} total")

    # Generate all valid operation combinations
    all_op_combos = []
    all_possible_ops = list(itertools.product(range(0, num_op_kinds), repeat=num_ops))
    
    for op in all_possible_ops:
        if is_valid_op_combination(op):
            all_op_combos.append(op)
    
    print(f"Valid operation combinations: {len(all_op_combos)} out of {len(all_possible_ops)} total")

    total_op_arg_combos = num_op_arg_values ** num_ops  # 32,768 shift combinations per operation set
    total_ab_combos = len(all_ab_combos)
    total_op_combos = len(all_op_combos)
    total_tests = total_ab_combos * total_op_combos * total_op_arg_combos
    print(f"Total search space: {total_ab_combos} (a,b) combinations × {total_op_combos} operation combinations × {total_op_arg_combos} shift combinations = {total_tests:,} tests")

    # Use ProcessPoolExecutor for parallel execution
    MAX_IN_FLIGHT = 64
    test_count = 0
    found_count = 0
    
    with ProcessPoolExecutor(max_workers=mp.cpu_count()) as executor:
        futures = []  # Track submitted tasks
        
        for ab_idx, (a_indices, b_indices) in enumerate(all_ab_combos):
            print(f"\nTesting (a, b) combination {ab_idx + 1}/{total_ab_combos}: a={a_indices}, b={b_indices}", flush=True)
            
            for op_idx, op in enumerate(all_op_combos):
                if op_idx % 5 == 0:  # Report progress every 5 op combinations
                    print(f"  Operation combination {op_idx + 1}/{total_op_combos}: {op}", flush=True)
                    
                for r in itertools.product(range(op_arg_start, op_arg_end), repeat=num_ops):
                    future = executor.submit(test, op, a_indices, b_indices, r)
                    futures.append((future, op, a_indices, b_indices, r, test_count))
                    test_count += 1
                    
                    # Limit number of tasks in flight
                    if len(futures) >= MAX_IN_FLIGHT:
                        # Process completed tasks
                        completed_futures = []
                        for fut, op_val, a_val, b_val, r_val, count in futures:
                            if fut.done():
                                ok = fut.result()
                                if ok:
                                    found_count += 1
                                    print(f"FOUND #{found_count}: a={a_val}, b={b_val}, op={op_val}, r={r_val}", flush=True)
                                
                                # Progress reporting every 10000 tests
                                if count % 10000 == 0:
                                    progress = (count / total_tests) * 100
                                    print(f"Progress: {count:,}/{total_tests:,} ({progress:.2f}%) - Found: {found_count}", flush=True)
                            else:
                                completed_futures.append((fut, op_val, a_val, b_val, r_val, count))
                        futures = completed_futures
        
        # Process remaining futures
        for fut, op_val, a_val, b_val, r_val, count in futures:
            ok = fut.result()
            if ok:
                found_count += 1
                print(f"FOUND #{found_count}: a={a_val}, b={b_val}, op={op_val}, r={r_val}", flush=True)

    print(f"\n=== SEARCH COMPLETE ===")
    print(f"Total tests: {test_count:,}")
    print(f"Full-period generators found: {found_count}")
    print(f"Success rate: {(found_count/test_count)*100:.3f}%" if test_count > 0 else "N/A")
