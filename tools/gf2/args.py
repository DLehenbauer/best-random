#!/usr/bin/env python3
"""
Generate a file named `args` containing every valid combination of input
parameters for `hunt.py`.

Each line is: i0 i1 i2 i3 c0 c1 c2 c3

By default writes to a file named `args` in the same directory. This script
streams output and prints progress every 1,000,000 lines.
"""

import itertools
import sys
from hunt import bit_width
from gf2 import Op

OUT_PATH = 'args'
PROGRESS_EVERY = 1_000_000

def main(out_path: str = OUT_PATH) -> int:
    total = 0
    with open(out_path, 'w', encoding='utf-8') as f:
        for i in itertools.product((0, 1), repeat=4):
            if i[0] == 0 and i[1] == 0:
                print(f"Skipping i={i} because i[0] == i[1] (no feedback)", file=sys.stderr)
                continue
            if i[2] == 1 and i[3] == 1:
                print(f"Skipping i={i} because i[2] == i[3] (no feedback)", file=sys.stderr)
                continue

            # Iterate over Op enum members for clarity; convert to ints when
            # writing the args file.
            for o in itertools.product((Op.SHR, Op.SHL, Op.ROL), repeat=2):
                # Skip configurations where both operation codes are SHR or both
                # are SHL. Keep (ROL,ROL).
                if o[0] == o[1] and o[0] in (Op.SHR, Op.SHL):
                    print(f"Skipping o=({o[0].name}, {o[1].name}) because all {o[0].name}", file=sys.stderr)
                    continue

                # For hunt.py we require both c0 and c1 to be in the range
                # 1..bit_width-1.
                for c in itertools.product(range(1, bit_width), repeat=2):
                    # write one combination per line; ensure ops are written as
                    # integers when emitting the args file
                    ops_as_ints = tuple(int(x) for x in o)
                    f.write(' '.join(map(str, tuple(i) + ops_as_ints + tuple(c))) + '\n')
                    total += 1
                    if total % PROGRESS_EVERY == 0:
                        print(f"Wrote {total} lines...", file=sys.stderr)
    print(f"Finished: wrote {total} lines to {out_path}", file=sys.stderr)
    return 0

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else OUT_PATH
    sys.exit(main(out))
