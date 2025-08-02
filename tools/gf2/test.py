#!/usr/bin/env python3

import sys
from gf2 import XorshiftAnalyzer

def test(c0: int, c1: int, c2: int):
    a = XorshiftAnalyzer(state_size=1, bit_width=8)

    def next_state_func(state):
        x = state[0]
        x ^= a.u(x << c0)
        x ^= a.u(x >> c1)
        x ^= a.u(x << c2)
        return [a.u(x)]
    
    def check_period(initial_state):
        # Use the provided initial state
        state = initial_state.copy()
        
        for iteration in range(1, a.max_period + 1):
            # Apply the next state function
            state = next_state_func(state)
            
            # Check if we've returned to initial state
            if state == initial_state:
                return iteration
            
        return -1

    result = a.check(next_state_func)    
    actual_period = check_period(initial_state=[1])
    
    if (result.period == a.max_period):
        assert result.period == actual_period, f"Theoretical period {result.period} does not match actual period {actual_period}."
        return True
    else:
        assert actual_period < a.max_period, f"Actual period {actual_period} should be less than max period {a.max_period}."
        assert result.period == -1 or result.period >= actual_period, f"Theoretical period {result.period} should be at least the actual period found {actual_period}."
        return False

if __name__ == "__main__":
    for c0 in range(0, 8):
        for c1 in range(0, 8):
            for c2 in range(0, 8):
                if (test(c0, c1, c2)):
                    print(f"({c0}, {c1}, {c2}): OK")
