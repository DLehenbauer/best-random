#!/usr/bin/env python3
"""
SIMD-style helper utilities for operating on pairs of 64-bit integers and
their byte / uint16 reinterpretations plus simple swizzle helpers.
"""

from typing import List, Sequence, Tuple

U64Pair = Tuple[int, int]

def o_simd(o_scalar, code: int, values: U64Pair, shift_amount: int) -> U64Pair:
    """
    Apply a scalar bit operation (dispatch via o_scalar) lane-wise to a pair of
    64-bit integers.

    Args:
        o_scalar: function(code, value, shift_amount) - performs shr/shl/rol/etc.
        code: operation code understood by o_scalar
        values: tuple (lane0, lane1)
        shift_amount: integer shift amount

    Returns:
        (result_lane0, result_lane1)
    """
    return (
        o_scalar(code, values[0], shift_amount),
        o_scalar(code, values[1], shift_amount),
    )

def u64x2_to_u8x16(v: U64Pair) -> List[int]:
    """
    Reinterpret a pair of unsigned 64-bit integers as 16 bytes (little-endian per lane).
    v: tuple (lo, hi) where each fits in 0..2**64-1
    Returns: list of 16 ints (0..255):
        bytes[0:8]  = little-endian bytes of v[0]
        bytes[8:16] = little-endian bytes of v[1]
    """
    return [(v[0] >> (8 * i)) & 0xFF for i in range(8)] + [(v[1] >> (8 * i)) & 0xFF for i in range(8)]

def u64x2_to_u16x8(v: U64Pair) -> List[int]:
    """
    Reinterpret a pair of unsigned 64-bit integers as 8 uint16 (little-endian per lane).
    v: tuple (lo, hi)
    Returns: list of 8 ints (0..65535):
        u16[0:4] = little-endian uint16 of v[0]
        u16[4:8] = little-endian uint16 of v[1]
    """
    return [(v[0] >> (16 * i)) & 0xFFFF for i in range(4)] + [(v[1] >> (16 * i)) & 0xFFFF for i in range(4)]

def u8x16_to_u64x2(b: Sequence[int]) -> U64Pair:
    """
    Reinterpret a 16-element array of bytes as a pair of unsigned 64-bit integers (little-endian per lane).
    b: sequence of 16 ints (0..255)
    Returns: (lo, hi)
    """
    if len(b) != 16:
        raise ValueError("Input list must have exactly 16 elements.")
    lo = sum(b[i] & 0xFF << (8 * i) for i in range(8))
    hi = sum(b[i + 8] & 0xFF << (8 * i) for i in range(8))
    return (lo, hi)

def u16x8_to_u64x2(u: Sequence[int]) -> U64Pair:
    """
    Reinterpret an 8-element array of uint16 as a pair of unsigned 64-bit integers (little-endian per lane).
    u: sequence of 8 ints (0..65535)
    Returns: (lo, hi)
    """
    if len(u) != 8:
        raise ValueError("Input list must have exactly 8 elements.")
    lo = sum((u[i] & 0xFFFF) << (16 * i) for i in range(4))
    hi = sum((u[i + 4] & 0xFFFF) << (16 * i) for i in range(4))
    return (lo, hi)

def u8x16_shuffle(u8: Sequence[int], shuffle: Sequence[int]) -> List[int]:
    """
    Shuffle a 16-element array based on a 16-element selector array.
    Each selector value in range 0..15 selects from `u8`.
    """
    if len(u8) != 16 or len(shuffle) != 16:
        raise ValueError("Both source and selector must have length 16.")
    return [u8[shuffle[i]] for i in range(16)]

def u16x8_shuffle(u16: Sequence[int], shuffle: Sequence[int]) -> List[int]:
    """
    Shuffle an 8-element array of uint16 based on an 8-element selector array.
    Each selector value in range 0..7 selects from `u16`.
    """
    if len(u16) != 8 or len(shuffle) != 8:
        raise ValueError("Both source and selector must have length 8.")
    return [u16[shuffle[i]] for i in range(8)]

__all__ = [
    "o_simd",
    "u64x2_to_u8x16",
    "u64x2_to_u16x8",
    "u8x16_to_u64x2",
    "u16x8_to_u64x2",
    "u8x16_shuffle",
    "u16x8_shuffle",
]
