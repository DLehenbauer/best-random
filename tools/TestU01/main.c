#include "TestU01.h"
#include <assert.h>
#include <math.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <time.h>

extern unif01_Gen *createGenerator(bool high32, bool low32, bool reversed);

int usage(char *name)
{
    printf("\n");
    printf("Usage: %s [-s] [-c] [-b] [-h] [-l] [-r] [-v]\n", name);
    printf("  -s = SmallCrush\n");
    printf("  -c = Crush\n");
    printf("  -b = BigCrush\n");
    printf("  -h = high32 bits\n");
    printf("  -l = low32 bits\n");
    printf("  -r = reverse bits\n");
    printf("  -v = verbose\n");
    return 1;
}

bool arg_hi = false;
bool arg_lo = false;
bool arg_rev = false;

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

bool run(void (*battery)(unif01_Gen *gen)) {
    unif01_Gen *gen = createGenerator(arg_hi, arg_lo, arg_rev);

    if (gen == NULL)
    {
        fprintf(stderr, "Error: Must specify high (-h) or low (-l)\n");
        return false;
    }

    battery(gen);
    
    struct sorted_result_t *results = malloc(bbattery_NTests * sizeof(struct sorted_result_t));
    
    for (int i = 0; i < bbattery_NTests; i++)
    {
        results[i].name = bbattery_TestNames[i];
        results[i].delta = bbattery_pVal[i] < 0.5
            ? bbattery_pVal[i]
            : 1.0 - bbattery_pVal[i];
    }

    qsort(results, bbattery_NTests, sizeof *results, sorted_result_cmp);

    bool passed = true;

    for (int i = 0; i < bbattery_NTests; i++)
    {
        bool testPassed = (bbattery_pVal[i] >= gofw_Suspectp) && (bbattery_pVal[i] <= 1.0 - gofw_Suspectp);

        printf("     %-30s %f%s\n",
            results[i].name,
            results[i].delta,
            testPassed
                ? ""
                : " FAIL!");

        passed &= testPassed;
    }

    free(results);
    unif01_DeleteExternGenBits(gen);

    return passed;
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

    if (arg_small)
    {
        if (!run(bbattery_SmallCrush)) { return 1; }
    }
    else if (arg_medium)
    {
        if (!run(bbattery_Crush)) { return 1; }
    }
    else if (arg_big)
    {
        if (!run(bbattery_BigCrush)) { return 1; }
    }
    else
    {
        fprintf(stderr, "Error: No test battery specified\n");
        return usage(argv[0]);
    }
}
