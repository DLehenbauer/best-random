#!/usr/bin/env python3

"""
Hunt for linear-GF2 PRNGs with maximal period.
"""

import itertools
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor, as_completed
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

def test(params):
    """
    Test a single parameter combination.
    
    Args:
        params: Tuple of (op, a, b, r) where:
            op: operation codes tuple
            a: 'a' indices tuple
            b: 'b' indices tuple  
            r: shift amounts tuple
    
    Returns:
        Tuple of (success, op, a, b, r) where success is True if maximal period found
    """
    op, a, b, r = params
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
    is_max_period = result == analyzer.max_period
    
    # Return result with parameters so we can identify successful combinations
    return (is_max_period, params)

if __name__ == "__main__":
    import time
    start_time = time.time()
    
    def format_time(seconds):
        """Format seconds into friendly time units."""
        if seconds < 60:
            return f"{seconds:.0f}s"
        elif seconds < 3600:
            return f"{seconds/60:.1f}m"
        elif seconds < 86400:
            return f"{seconds/3600:.1f}h"
        else:
            return f"{seconds/86400:.1f}d"
    
    print(f"--- BEGIN: (bit_width={bit_width}, state_size={state_size})", flush=True)

    # Calculate total search space for progress reporting
    num_op_kinds = 3  # 0 = shr, 1 = shl, 2 = rol
    num_ops = 3       # number of variable operations in next_state_func search
    op_arg_start = 0
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

    total_op_arg_combos = num_op_arg_values ** num_ops
    total_ab_combos = len(all_ab_combos)
    total_op_combos = len(all_op_combos)
    total_tests = total_ab_combos * total_op_combos * total_op_arg_combos
    print(f"Total search space: {total_ab_combos} (a,b) combinations × {total_op_combos} operation combinations × {total_op_arg_combos} shift combinations = {total_tests:,} tests")

    # Create a lazy generator for test parameters to avoid using excessive memory
    # This generates combinations on-the-fly as they're consumed by worker processes
    def generate_test_params():
        """
        Lazy generator for test parameter combinations.
        
        Yields tuples of (op, a_indices, b_indices, r) without storing them all in memory.
        This is memory-efficient for large search spaces.
        """
        for a_indices, b_indices in all_ab_combos:
            for op in all_op_combos:
                for r in itertools.product(range(op_arg_start, op_arg_end), repeat=num_ops):
                    yield (op, a_indices, b_indices, r)
    
    print(f"Using lazy generation for {total_tests:,} test parameter combinations", flush=True)
    
    # Use ProcessPoolExecutor with a simple and efficient submission pattern
    test_count = 0
    found_count = 0    
    
    num_workers = mp.cpu_count()
    print(f"Starting parallel execution with {num_workers} workers...", flush=True)
    
    # Limit in-flight tasks to balance memory usage and parallelism
    # This many tasks allows good pipeline depth without excessive memory
    MAX_IN_FLIGHT = num_workers * 100
    
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        print(f"Using MAX_IN_FLIGHT={MAX_IN_FLIGHT} for efficient pipeline", flush=True)
        
        # Create parameter generator
        param_generator = generate_test_params()
        
        # Use a set for O(1) removal of completed futures
        pending = set()
        
        # Helper to submit one task
        def submit_one():
            try:
                params = next(param_generator)
                pending.add(executor.submit(test, params))
                return True
            except StopIteration:
                return False
        
        # Fill initial pipeline
        for _ in range(MAX_IN_FLIGHT):
            if not submit_one():
                break
        
        print(f"Submitted initial batch of {len(pending)} tasks", flush=True)
        
        # Process results as they complete, submitting replacements in batches
        # This keeps workers fully utilized and amortizes iterator recreation cost
        while pending:
            # Collect all completed futures in this iteration
            # This amortizes iterator recreation cost across multiple completions
            completed = []
            for completed_future in as_completed(pending):
                completed.append(completed_future)
                submit_one()
            
            # Process all completed futures
            for completed_future in completed:
                # Remove the completed future from pending set
                pending.discard(completed_future)

                # Process the completed future
                is_max_period, params = completed_future.result()
                test_count += 1
                
                if is_max_period:
                    found_count += 1
                    print(f"FOUND #{found_count}: params={params}", flush=True)
                
                # Progress reporting
                if test_count % 10000 == 0:
                    progress = (test_count / total_tests) * 100
                    elapsed = time.time() - start_time
                    rate = test_count / elapsed if elapsed > 0 else 0
                    eta_seconds = (total_tests - test_count) / rate if rate > 0 else 0
                    eta_str = format_time(eta_seconds)
                    elapsed_str = format_time(elapsed)
                    print(f"Progress: {test_count:,}/{total_tests:,} ({progress:.2f}%) - Found: {found_count} - Elapsed: {elapsed_str} - Rate: {rate:.0f} tests/s - ETA: {eta_str}", flush=True)
    
    end_time = time.time()
    elapsed_time = end_time - start_time
    elapsed_str = format_time(elapsed_time)
    
    print(f"\n=== SEARCH COMPLETE ===")
    print(f"Total tests: {test_count:,}")
    print(f"Full-period generators found: {found_count}")
    print(f"Success rate: {(found_count/test_count)*100:.3f}%" if test_count > 0 else "N/A")
    print(f"Elapsed time: {elapsed_str}")
    print(f"Average rate: {test_count/elapsed_time:.0f} tests/s" if elapsed_time > 0 else "N/A")
