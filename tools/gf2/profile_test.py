#!/usr/bin/env python3

import cProfile
import pstats
from io import StringIO
from test import test

# Profile a few tests
pr = cProfile.Profile()
pr.enable()

for i in range(100):
    test(1, 1, 14)

pr.disable()

# Print stats
s = StringIO()
ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
ps.print_stats(30)
print(s.getvalue())
