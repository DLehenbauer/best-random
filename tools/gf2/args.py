#!/usr/bin/env python3

"""
Process results.txt from stdin and emit args in GNU parallel format.

Reads lines containing FOUND results with params tuples and outputs
space-separated parameter values, one line per result.

Example input:
    FOUND #1: params=((0, 1, 2), (3, 4, 5))

Example output:
    0 1 2 3 4 5
"""

import sys
import re
import ast

def parse_params(line):
    """
    Extract and parse the params tuple from a FOUND line.
    
    Args:
        line: A line containing "params=..." 
        
    Returns:
        Tuple of tuples, or None if parsing fails
    """
    # Look for params= pattern
    match = re.search(r'params=(\(.+\))', line)
    if not match:
        return None
    
    params_str = match.group(1)
    
    try:
        # Use ast.literal_eval to safely parse the tuple
        params = ast.literal_eval(params_str)
        return params
    except (ValueError, SyntaxError):
        return None

def flatten_params(params):
    """
    Flatten nested tuples into a single list of values.
    
    Args:
        params: Tuple of tuples, e.g., ((0, 1, 2), (3, 4, 5))
        
    Returns:
        List of flattened values, e.g., [0, 1, 2, 3, 4, 5]
    """
    result = []
    for item in params:
        if isinstance(item, (tuple, list)):
            result.extend(item)
        else:
            result.append(item)
    return result

def main():
    """
    Read lines from stdin, parse params, and output space-separated args.
    """
    for line in sys.stdin:
        line = line.strip()
        if not line or 'params=' not in line:
            continue
        
        params = parse_params(line)
        if params is None:
            continue
        
        # Flatten the params and output as space-separated values
        flat_params = flatten_params(params)
        print(' '.join(map(str, flat_params)))

if __name__ == "__main__":
    main()
