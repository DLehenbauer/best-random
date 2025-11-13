#!/usr/bin/env python3
"""
Generate all valid combinations of p[] parameters for x5 RNG testing.

p[0..5] = mixing parameters: a, b, c, op1, op2, d

where:
- a, b, d: state indices (0=s0, 1=s1)
- c: rotation amount (0..63)
- op1, op2: operation code (0=+, 1=^, 2=-)

Symmetry pruning:
- For commutative op1 (+ or ^), only enumerate pairs with a <= b (skip a > b).
- For subtraction (op1 == 2), enumerate all a,b permutations.
op2 uses result and d; no symmetry pruning applied there.

Since x5 has only 2 state variables (s0, s1), a/b/d can only be 0 or 1.
"""

import itertools

# Parameter ranges for x5
state_indices = [0, 1]      # s[0], s[1] (only 2 state variables in x5)
rotations = range(64)       # 0..63 (64-bit rotations)
operations = [0, 1, 2]      # 0=+, 1=^, 2=-

# Generate all parameter combinations
for a in state_indices:
    for b in state_indices:
        for c in rotations:
            for op1 in operations:
                # Prune symmetric a,b for commutative op1 (+ or ^)
                if op1 in (0, 1) and a > b:
                    continue
                for op2 in operations:
                    for d in state_indices:
                        # Output as space-separated values
                        print(f"{a} {b} {c} {op1} {op2} {d}")
