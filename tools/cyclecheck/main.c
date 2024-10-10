#include <assert.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <stdlib.h>
#include <stdint.h>

static uint64_t x = 88172645463325252LL;

void advance()
{
    x ^= (x << 9);
    x ^= (x >> 7);
}

int main(int argc, char *argv[]) {
    FILE* fp = freopen(NULL, "wb", stdout);  // Only necessary on Windows, but harmless.
    assert(fp);

    // Get the default values for p0/p1 from the RNG
    uint64_t startX = x;
    uint64_t length = 0;
    
    while (1) {
        advance();
        
        if (x == startX) {
            break;
        }

        if ((length << 32) == 0)
        {
            printf("x: %lx, length: %lu\n", x, length);
        }

        length++;
    }

    printf("Cycle length: %lu\n", length);

    return 0;
}
