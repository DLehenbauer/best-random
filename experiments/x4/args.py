#!/usr/bin/env python3
"""
Generate all valid combinations of p[] parameters for RNG testing.

p[0..5] = hi parameters: a, b, c, op1, op2, d
p[6..11] = lo parameters: a, b, c, op1, op2, d

where:
- a, b, d: state indices (0, 1, 2)
- c: rotation amount (0..31)
- op1, op2: operation (0=+/^, 1=-)
"""

import itertools

# Parameter ranges
state_indices = [0, 1, 2]  # s[0], s[1], s[2]
rotations = range(32)       # 0..31
operations = [0, 1]         # 0=+/^, 1=-

# Generate all combinations for one half (hi or lo)
def generate_half_params():
    for a in state_indices:
        for b in state_indices:
            for c in rotations:
                for op1 in operations:
                    for op2 in operations:
                        for d in state_indices:
                            yield (a, b, c, op1, op2, d)

# Generate all full parameter combinations
for hi_params in generate_half_params():
    for lo_params in generate_half_params():
        # Combine hi and lo parameters
        p = hi_params + lo_params
        # Output as space-separated values
        print(' '.join(map(str, p)))
