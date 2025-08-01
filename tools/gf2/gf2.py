#!/usr/bin/env python3
"""
XorShift Generator Coefficient Search Program

This program searches for shift coefficients for xorshift generators that produce
maximal period by testing that the characteristic polynomial is primitive and
irreducible over GF(2).

Author: Generated for best-random project
"""

import numpy as np
import galois
import sympy as sp
from typing import List, Callable, Tuple, Optional, Dict, Any
import itertools
import logging
import time
from dataclasses import dataclass

def _u32(value: int) -> int:
    """Apply 32-bit unsigned integer mask."""
    return value & 0xFFFFFFFF

def _u64(value: int) -> int:
    """Apply 64-bit unsigned integer mask."""
    return value & 0xFFFFFFFFFFFFFFFF

@dataclass
class SearchResult:
    period: int
    is_primitive: bool
    is_irreducible: bool
    polynomial: str
    state_size: int

class XorshiftAnalyzer:
    """
    Analyzer for xorshift generators to find coefficients that produce maximal period.
    
    This class can handle state arrays of any length and state elements that are
    32-bit or 64-bit unsigned integers.
    """
    
    def __init__(self, state_size: int, bit_width: int = 32):
        """
        Initialize the analyzer.
        
        Args:
            state_size: Number of elements in the state array
            bit_width: Bit width of each state element (32 or 64)
        """
        self.state_size = state_size
        self.bit_width = bit_width
        self.total_bits = state_size * bit_width
        self.max_value = (1 << bit_width) - 1
        
        # Initialize Galois field GF(2)
        self.GF2 = galois.GF(2)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, 
                          format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
    
    def _mask_value(self, value: int) -> int:
        """Apply appropriate bit mask based on bit width."""
        if self.bit_width == 32:
            return _u32(value)
        elif self.bit_width == 64:
            return _u64(value)
        else:
            return value & self.max_value
    
    def state_to_bits(self, state: List[int]) -> np.ndarray:
        """
        Convert state array to bit vector.
        
        Args:
            state: State array of integers
            
        Returns:
            Binary vector representation in GF(2)
        """
        bits = []
        for element in state:
            # Convert each element to binary representation
            element_bits = [(element >> i) & 1 for i in range(self.bit_width)]
            bits.extend(element_bits)
        
        return self.GF2(bits)
    
    def bits_to_state(self, bits: np.ndarray) -> List[int]:
        """
        Convert bit vector back to state array.
        
        Args:
            bits: Binary vector in GF(2)
            
        Returns:
            State array of integers
        """
        state = []
        for i in range(self.state_size):
            element = 0
            start_idx = i * self.bit_width
            for j in range(self.bit_width):
                if bits[start_idx + j]:
                    element |= (1 << j)
            state.append(element)
        
        return state
    
    def build_characteristic_matrix(self, next_state_func: Callable[[List[int]], List[int]]) -> np.ndarray:
        """
        Build the characteristic matrix from the next_state function.
        
        The matrix represents the linear transformation in GF(2) that the
        next_state function performs on the bit representation.
        
        Args:
            next_state_func: Function that takes current state and returns next state
            
        Returns:
            Characteristic matrix in GF(2)
        """
        print(f"Building {self.total_bits}x{self.total_bits} characteristic matrix...")
        start_time = time.time()
        
        matrix = np.zeros((self.total_bits, self.total_bits), dtype=int)
        
        # Test with each basis vector (single bit set)
        for i in range(self.total_bits):
            print(f"  Progress: {i}/{self.total_bits} ({100*i//self.total_bits}%)")
            
            # Create basis vector
            basis_bits = np.zeros(self.total_bits, dtype=int)
            basis_bits[i] = 1
            
            # Convert to state representation
            input_state = self.bits_to_state(basis_bits)
            
            # Apply next_state function
            output_state = next_state_func(input_state)
            
            # Convert back to bits and store as column in matrix
            output_bits = self.state_to_bits(output_state)
            matrix[:, i] = output_bits

        # Convert to GF(2) matrix
        gf2_matrix = self.GF2(matrix)

        end_time = time.time()
        total_time = end_time - start_time
        
        
        # Print the matrix with full output (no truncation)
        print(f"\nCharacteristic Matrix ({self.total_bits}x{self.total_bits}):")
        with np.printoptions(threshold=np.inf, linewidth=np.inf):
            print(gf2_matrix)

        print(f"\n(Matrix construction complete in {total_time:.2f} seconds.)\n")

        return gf2_matrix
    
    def get_characteristic_polynomial(self, matrix: np.ndarray) -> galois.Poly:
        """
        Get the characteristic polynomial of the matrix.
        
        Args:
            matrix: Characteristic matrix in GF(2)
            
        Returns:
            Characteristic polynomial
        """
        print("Computing characteristic polynomial...")
        start_time = time.time()
        
        # Compute characteristic polynomial: det(xI - A)
        poly = matrix.characteristic_poly()
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"  Characteristic polynomial computed in {elapsed_time:.2f} seconds!")
        
        # Print the characteristic polynomial
        print(f"\nCharacteristic Polynomial:")
        print(f"  {poly}")
        
        return poly
    
    def is_irreducible_polynomial(self, poly: galois.Poly) -> bool:
        """
        Test if polynomial is irreducible over GF(2).
        
        Args:
            poly: Polynomial to test
            
        Returns:
            True if polynomial is irreducible
        """
        return poly.is_irreducible()
    
    def is_primitive_polynomial(self, poly: galois.Poly) -> bool:
        """
        Test if polynomial is primitive over GF(2).
        
        A polynomial is primitive if it is irreducible and its roots generate
        the multiplicative group of the extension field.
        
        Args:
            poly: Polynomial to test
            
        Returns:
            True if polynomial is primitive
        """
        if not self.is_irreducible_polynomial(poly):
            return False
        
        return poly.is_primitive()
    
    def calculate_period(self, matrix: np.ndarray) -> int:
        """
        Calculate the period of the linear transformation.
        
        Args:
            matrix: Characteristic matrix
            
        Returns:
            Period of the transformation
        """
        # For a primitive polynomial of degree n, the period is 2^n - 1
        poly = self.get_characteristic_polynomial(matrix)
        if self.is_primitive_polynomial(poly):
            return (1 << poly.degree) - 1
        
        # If not primitive, we need to find the actual period
        # This is computationally expensive for large matrices
        self.logger.warning("Non-primitive polynomial detected. Period calculation may be slow.")
        
        print("Computing minimal polynomial...")
        start_time = time.time()
        
        # Find minimal polynomial and its period
        min_poly = matrix.minimal_poly()
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"  Minimal polynomial computed in {elapsed_time:.2f} seconds!")
        
        if self.is_primitive_polynomial(min_poly):
            return (1 << min_poly.degree) - 1
        
        return -1  # Unable to determine period efficiently
    
    
    def validate_known_generator(self, next_state_func: Callable[[List[int]], List[int]]) -> SearchResult:
        """
        Validate a known generator function.
        
        Args:
            next_state_func: The generator function to validate
            
        Returns:
            Analysis results
        """
        print(f"Analyzing generator with {self.state_size}x{self.bit_width}-bit state...")
        
        matrix = self.build_characteristic_matrix(next_state_func)
        poly = self.get_characteristic_polynomial(matrix)
        
        print("Testing polynomial properties...")
        is_irreducible = self.is_irreducible_polynomial(poly)
        print(f"  Irreducible: {is_irreducible}")
        
        is_primitive = self.is_primitive_polynomial(poly) if is_irreducible else False
        print(f"  Primitive: {is_primitive}")
        
        period = self.calculate_period(matrix) if is_primitive else -1
        print("Analysis complete!")
        
        return SearchResult(
            period=period,
            is_primitive=is_primitive,
            is_irreducible=is_irreducible,
            polynomial=str(poly),
            state_size=self.state_size
        )

def main():
    def next_state(state: List[int]) -> List[int]:
        """Your specific next_state function from the task description."""
        t = state[0]
        
        t ^= _u32(t << 13)
        t ^= _u32(t >> 17)
        t ^= _u32(t << 5)

        return [_u32(t)]
    
    # Analyze the generator
    analyzer = XorshiftAnalyzer(state_size=1, bit_width=32)
    
    print("Analyzing your xorshift generator...")
    result = analyzer.validate_known_generator(next_state)
    
    print(f"\nGenerator Analysis Results:")
    print(f"  Polynomial: {result.polynomial}")
    print(f"  Is Primitive: {result.is_primitive}")
    print(f"  Is Irreducible: {result.is_irreducible}")
    print(f"  Expected Period: {result.period}")
    
    if result.is_primitive:
        print("  ✓ Your generator has maximal period!")
    else:
        print("  ⚠ Your generator does not have maximal period.")

if __name__ == "__main__":
    main()
