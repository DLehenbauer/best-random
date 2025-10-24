#!/usr/bin/env python3
"""
XorShift Generator Coefficient Search Program

This program searches for shift coefficients for xorshift generators that produce
maximal period by testing that the characteristic polynomial is primitive and
irreducible over GF(2).
"""

import numpy as np
from flint import nmod_mat
import galois
from typing import List, Callable
import logging
from enum import IntEnum

class Op(IntEnum):
    SHR = 0
    SHL = 1
    ROL = 2

class XorshiftAnalyzer:
    """
    Analyzer for xorshift generators to find coefficients that produce maximal period.
    
    This class can handle state arrays of any length and state elements that are
    any power-of-2 bit width (1, 2, 4, 8, 16, 32, 64, 128, etc.).
    """
    
    def __init__(self, state_size: int, bit_width: int = 32):
        """
        Initialize the analyzer.
        
        Args:
            state_size: Number of elements in the state array
            bit_width: Bit width of each state element (must be a power of 2)
        """
        # Validate that bit_width is a power of 2
        if bit_width <= 0 or (bit_width & (bit_width - 1)) != 0:
            raise ValueError(f"bit_width must be a positive power of 2, got {bit_width}")
        
        self.state_size = state_size
        self.bit_width = bit_width
        self.total_bits = state_size * bit_width
        self.max_value = (1 << bit_width) - 1
        self.max_period = (2 ** self.total_bits) - 1
        
        # Initialize Galois field GF(2) for polynomial operations
        self.GF2 = galois.GF(2)
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, 
                          format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
    
    def shl(self, value: int, shift: int) -> int:
        return self.u(value << shift)

    def shr(self, value: int, shift: int) -> int:
        return value >> shift

    def rol(self, value: int, shift: int) -> int:
        shift &= (self.bit_width - 1)
        return self.shl(value, shift) | self.shr(value, self.bit_width - shift)

    def op(self, operation: Op, left: int, right: int) -> int:
        if operation is Op.SHR:
            return self.shr(left, right)
        if operation is Op.SHL:
            return self.shl(left, right)
        if operation is Op.ROL:
            return self.rol(left, right)
        
        raise ValueError(f"Unhandled operation: {operation}")

    def u(self, value: int) -> int:
        """
        Apply appropriate bit mask based on bit width.
        
        Works with any power-of-2 bit width by using the precomputed max_value mask.
        
        Args:
            value: Integer value to mask
            
        Returns:
            Masked value within the bit width range
        """
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
    
    def state_to_bits_raw(self, state: List[int]) -> np.ndarray:
        """
        Convert state array to bit vector without GF2 wrapping (for performance).
        
        Returns a plain numpy array instead of a galois field array. This is faster
        when the result will be used for intermediate computations that don't require
        GF2 field operations.
        
        Args:
            state: State array of integers
            
        Returns:
            Binary vector as plain numpy array (not GF(2))
        """
        bits = []
        for element in state:
            # Convert each element to binary representation
            element_bits = [(element >> i) & 1 for i in range(self.bit_width)]
            bits.extend(element_bits)
        
        return np.array(bits, dtype=int)
    
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
        # Pre-allocate matrix as numpy array (convert to GF2 only once at end)
        matrix = np.zeros((self.total_bits, self.total_bits), dtype=int)
        
        # Test with each basis vector (single bit set)
        for i in range(self.total_bits):
            # Create basis vector
            basis_bits = np.zeros(self.total_bits, dtype=int)
            basis_bits[i] = 1
            
            # Convert to state representation
            input_state = self.bits_to_state(basis_bits)
            
            # Apply next_state function
            output_state = next_state_func(input_state)
            
            # Validate output_state
            if len(output_state) != self.state_size:
                raise ValueError(f"next_state_func returned state with length {len(output_state)}, expected {self.state_size}")
            
            for j, element in enumerate(output_state):
                if not isinstance(element, int):
                    raise TypeError(f"output_state[{j}] is not an integer: {type(element)}")
                if element != self.u(element):
                    raise ValueError(f"output_state[{j}] = {element} does not fit in {self.bit_width} bits (should be {self.u(element)})")
            
            # Convert back to bits and store as column in matrix
            # Use the raw version to avoid expensive GF2 array creation in hot loop
            output_bits = self.state_to_bits_raw(output_state)
            matrix[:, i] = output_bits

        # Convert to GF(2) matrix only once at the end
        gf2_matrix = self.GF2(matrix)
        
        # Print the matrix with full output (no truncation)
        self.logger.debug(f"\nCharacteristic Matrix ({self.total_bits}x{self.total_bits}):")
        if self.logger.isEnabledFor(logging.DEBUG):
            with np.printoptions(threshold=np.inf, linewidth=np.inf):
                self.logger.debug(f"{gf2_matrix}")

        return gf2_matrix
    
    def get_characteristic_polynomial(self, matrix: np.ndarray) -> galois.Poly:
        """
        Get the characteristic polynomial of the matrix using FLINT for acceleration.
        
        Args:
            matrix: Characteristic matrix in GF(2)
            
        Returns:
            Characteristic polynomial converted to galois.Poly for compatibility
        """

        # Convert galois matrix to FLINT nmod_mat for faster computation
        flint_matrix = nmod_mat(self.total_bits, self.total_bits, 2)
        
        # Copy data from galois matrix to FLINT matrix
        # Access the underlying numpy array directly to avoid expensive galois array indexing
        # The .view(np.ndarray) gives us direct access to the raw integer data
        matrix_data = matrix.view(np.ndarray)
        
        for i in range(self.total_bits):
            for j in range(self.total_bits):
                # Access the numpy array directly - much faster than galois array indexing
                flint_matrix[i, j] = int(matrix_data[i, j])
        
        # Compute characteristic polynomial using FLINT (much faster)
        flint_poly = flint_matrix.charpoly()
        
        # Convert FLINT polynomial back to galois polynomial for compatibility
        # Extract coefficients from FLINT polynomial
        coeffs = []
        for i in range(flint_poly.degree() + 1):
            coeffs.append(flint_poly[i])
        
        # Create galois polynomial from coefficients
        galois_poly = galois.Poly(coeffs, field=self.GF2)
                
        # Log the characteristic polynomial (only if debug logging is enabled)
        # Note: We use lazy evaluation with lambda to avoid expensive str() conversion
        # when debug logging is disabled
        if self.logger.isEnabledFor(logging.DEBUG):
            self.logger.debug(f"Characteristic Polynomial: {galois_poly}")
            self.logger.debug(f"Polynomial Degree: {galois_poly.degree}")
        
        return galois_poly
    
    def calculate_period(self, poly: galois.Poly) -> int:
        """
        Calculate the period of the linear transformation.
        
        Args:
            poly: Characteristic polynomial
            
        Returns:
            Period of the transformation
        """
        # For a primitive polynomial of degree n, the period is 2^n - 1
        if poly.is_primitive():
            return (1 << poly.degree) - 1
        
        return -1
    
    def check(self, next_state_func: Callable[[List[int]], List[int]]) -> int:
        """
        Validate a known generator function.
        
        Args:
            next_state_func: The generator function to validate
            
        Returns:
            Period of the generator (-1 if not primitive/maximal period)
        """
        self.logger.debug(f"Analyzing generator with {self.state_size}x{self.bit_width}-bit state...")
        
        matrix = self.build_characteristic_matrix(next_state_func)
        poly = self.get_characteristic_polynomial(matrix)        
        period = self.calculate_period(poly)
        
        return period
