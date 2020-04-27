#include "TestU01.h"

#include <assert.h>
#include <math.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <time.h>

#define ELEMENT_COUNT 255
#define BUFFER_SIZE (sizeof(uint32_t) * ELEMENT_COUNT)

int usage(char *name)
{
    printf("\n");
    printf("Usage: <PRNG_output> | %s [-s] [-c] [-b] [-h] [-l] [-r] [-v]\n", name);
    printf("  -s = SmallCrush\n");
    printf("  -c = Crush\n");
    printf("  -b = BigCrush\n");
    printf("  -h = high32 bits\n");
    printf("  -l = low32 bits\n");
    printf("  -r = reverse bits\n");
    printf("  -v = verbose\n");
    return 1;
}

static inline uint64_t stdin32bit()
{
    static uint32_t buffer32[ELEMENT_COUNT];
    static int i = ELEMENT_COUNT;

    if (i == ELEMENT_COUNT)
    {
        uint8_t bufferRead = fread(&buffer32, sizeof(uint32_t), ELEMENT_COUNT, stdin);
        assert(bufferRead);
        i = 0;
    }

    return buffer32[i++];
}

inline uint64_t stdin64bit()
{
    uint64_t uint64bit;
    uint8_t bufferRead = fread(&uint64bit, sizeof(uint64_t), 1, stdin);
    assert(bufferRead);
    return uint64bit;
}

inline uint32_t reverse32(uint32_t v)
{
    v = ((v >> 1) & 0x55555555) | ((v & 0x55555555) << 1);
    v = ((v >> 2) & 0x33333333) | ((v & 0x33333333) << 2);
    v = ((v >> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
    v = ((v >> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
    v = (v >> 16) | (v << 16);
    return v;
}

inline uint32_t high32(uint64_t v) { return (uint32_t)(v >> 32); }
inline uint32_t low32(uint64_t v) { return (uint32_t)(v); }

uint32_t gen32() { return stdin32bit(); }
uint32_t gen32_rev() { return reverse32(gen32()); }
uint32_t gen32_high() { return high32(stdin64bit()); }
uint32_t gen32_high_rev() { return reverse32(gen32_high()); }
uint32_t gen32_low() { return low32(stdin64bit()); }
uint32_t gen32_low_rev() { return reverse32(gen32_low()); }

bool arg_hi = false;
bool arg_lo = false;
bool arg_rev = false;

unif01_Gen *createGenerator()
{
    if (arg_hi)
    {
        if (arg_rev)
        {
            return unif01_CreateExternGenBits("stdin high 32b (reversed)", gen32_high_rev);
        }
        else
        {
            return unif01_CreateExternGenBits("stdin high 32b", gen32_high);
        }
    }
    else if (arg_lo)
    {
        if (arg_rev)
        {
            return unif01_CreateExternGenBits("stdin low 32b (reversed)", gen32_low_rev);
        }
        else
        {
            return unif01_CreateExternGenBits("stdin low 32b", gen32_low);
        }
    }
    else
    {
        if (arg_rev)
        {
            return unif01_CreateExternGenBits("stdin 32b (reversed)", gen32_rev);
        }
        else
        {
            return unif01_CreateExternGenBits("stdin 32b", gen32);
        }
    }
}

struct sorted_result_t
{
    char *name;
    double delta;
};

static int sorted_result_cmp(const void *left, const void *right)
{
    const struct sorted_result_t *leftResult = left, *rightResult = right;

    return leftResult->delta < rightResult->delta
               ? 1
               : leftResult->delta > rightResult->delta
                     ? -1
                     : 0;
}

bool success()
{
    struct sorted_result_t *results = malloc(bbattery_NTests * sizeof(struct sorted_result_t));
    for (int i = 0; i < bbattery_NTests; i++)
    {
        results[i].name = bbattery_TestNames[i];
        results[i].delta = bbattery_pVal[i] < 0.5
                               ? bbattery_pVal[i]
                               : 1.0 - bbattery_pVal[i];
    }

    qsort(results, bbattery_NTests, sizeof *results, sorted_result_cmp);

    for (int i = 0; i < bbattery_NTests; i++)
    {
        printf("     %-30s %f%s\n", results[i].name, results[i].delta, results[i].delta < gofw_Suspectp ? "  FAIL!" : "");
    }

    for (uint32_t j = 0; j < bbattery_NTests; j++)
    {
        if ((bbattery_pVal[j] < gofw_Suspectp) || (bbattery_pVal[j] > 1.0 - gofw_Suspectp))
        {
            return false;
        }
    }

    free(results);

    return true;
}

int main(int argc, char *argv[])
{
    swrite_Basic = FALSE;
    bool arg_small = false;
    bool arg_medium = false;
    bool arg_big = false;

    for (int i = 1; i < argc; i++)
    {
        if (strcmp(argv[i], "-s") == 0)
        {
            arg_small = true;
        }
        else if (strcmp(argv[i], "-c") == 0)
        {
            arg_medium = true;
        }
        else if (strcmp(argv[i], "-b") == 0)
        {
            arg_big = true;
        }
        else if (strcmp(argv[i], "-h") == 0)
        {
            arg_hi = true;
        }
        else if (strcmp(argv[i], "-l") == 0)
        {
            arg_lo = true;
        }
        else if (strcmp(argv[i], "-r") == 0)
        {
            arg_rev = true;
        }
        else if (strcmp(argv[i], "-v") == 0)
        {
            swrite_Basic = TRUE;
        }
        else
        {
            fprintf(stderr, "Error: Invalid argument '%s'.\n", argv[i]);
            return usage(argv[0]);
        }
    }

    setvbuf(stdin, (char *)NULL, _IOFBF, BUFFER_SIZE); // full buffering mode
    unif01_Gen *gen = createGenerator();

    if (arg_small)
    {
        bbattery_SmallCrush(gen);
    }
    else if (arg_medium)
    {
        bbattery_Crush(gen);
    }
    else if (arg_big)
    {
        bbattery_BigCrush(gen);
    }
    else
    {
        fprintf(stderr, "Error: No test battery specified\n");
        return usage(argv[0]);
    }

    unif01_DeleteExternGenBits(gen);

    return success() ? 0 : 1;
}
