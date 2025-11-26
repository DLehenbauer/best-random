#!/usr/bin/env python3
"""
Generate all valid combinations of p[] parameters for x5 RNG testing.

p[0..5] = mixing parameters as defined in x5/rng/rng.h:
- p[0]: sa - state index (0=s0, 1=s1)
- p[1]: sb - state index (0=s0, 1=s1)
- p[2]: op1 - operation code (0=^, 1=+, 2=-)
- p[3]: rl - rotation amount (0..63)
- p[4]: sc - state index (0=s0, 1=s1)
- p[5]: op2 - operation code (0=^, 1=+, 2=-)

Symmetry pruning:
- For commutative op1 (^ or +), only enumerate pairs with sa <= sb (skip sa > sb).
- For subtraction (op1 == 2), enumerate all sa,sb permutations.
op2 uses result and sc; no symmetry pruning applied there.

Since x5 has only 2 state variables (s0, s1), sa/sb/sc can only be 0 or 1.
"""

import itertools

# Parameter ranges for x5
state_indices = [0, 1]      # s[0], s[1] (only 2 state variables in x5/rng/rng.h)
rotations = range(64)       # 0..63 (64-bit rotations)
operations = [0, 1, 2]      # 0=^, 1=+, 2=-

# Generate all parameter combinations
for sa in state_indices:
    for sb in state_indices:
        for op1 in operations:
            # Prune symmetric sa,sb for commutative op1 (^ or +)
            if op1 in (0, 1) and sa > sb:
                continue
            for rl in rotations:
                for sc in state_indices:
                    for op2 in operations:
                        # Output as space-separated values in correct order for rng.h
                        # p[0]=sa, p[1]=sb, p[2]=op1, p[3]=rl, p[4]=sc, p[5]=op2
                        print(f"{sa} {sb} {op1} {rl} {sc} {op2}")
