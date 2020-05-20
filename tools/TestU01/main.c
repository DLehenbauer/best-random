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
    printf("  -x = loop\n");
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

int totalIterations = 0;
int totalIterationsFailed = 0;
double totalRun = 0;
double totalUnusual = 0;
double totalSuspicious = 0;
double totalFailed = 0;
unif01_Gen *gen = NULL;

bool run(char* name, void (*battery)(unif01_Gen *gen))
{
    totalIterations++;

    srand((unsigned) time(NULL));
    gen = createGenerator(arg_hi, arg_lo, arg_rev);

    if (gen == NULL)
    {
        fprintf(stderr, "Error: Must specify high (-h) or low (-l)\n");
        return 1;
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

    int numFailed = 0;
    int numSuspicious = 0;
    int numUnusual = 0;

    for (int i = 0; i < bbattery_NTests; i++)
    {
        bool testFailed = results[i].delta < gofw_Suspectp;
        bool testSuspicious = !testFailed && results[i].delta < 0.0025;
        bool testUnusual    = !testSuspicious && results[i].delta < 0.01;

        if (testFailed)
        {
            numFailed++;
        }
        else if (testSuspicious)
        {
            numSuspicious++;    
        }
        else if (testUnusual)
        {
            numUnusual++;
        }
        else if (!swrite_Basic)
        {
            continue;
        }

        printf("     %-30s %f%s\n",
            results[i].name,
            results[i].delta,
            testFailed
                ? "    FAIL!"
                : testSuspicious
                    ? "    suspicious"
                    : testUnusual
                        ? "    unusual"
                        : "");
    }

    printf("\n%s %s: Passed %d/%d iterations%s\n",
        gen->name,
        name,
        totalIterations - totalIterationsFailed,
        totalIterations,
        numFailed == 0
            ? ""
            : " - FAIL!");

    totalRun += bbattery_NTests;
    totalFailed += numFailed;
    totalSuspicious += numSuspicious;
    totalUnusual += numUnusual;

    free(results);    
    unif01_DeleteExternGenBits(gen);

    if (numFailed > 0) {
        totalIterationsFailed++;
        return false;
    }

    return numFailed == 0;
}

int main(int argc, char *argv[])
{
    swrite_Basic = FALSE;
    bool arg_small = false;
    bool arg_medium = false;
    bool arg_big = false;
    bool arg_loop = false;

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
        else if (strcmp(argv[i], "-x") == 0)
        {
            arg_loop = TRUE;
        }
        else
        {
            fprintf(stderr, "Error: Invalid argument '%s'.\n", argv[i]);
            return usage(argv[0]);
        }
    }

    do {
        if (arg_small)
        {
            if (!run("SmallCrush", bbattery_SmallCrush) && !arg_loop) { return 1; }
        }
        else if (arg_medium)
        {
            if (!run("Crush", bbattery_Crush) && !arg_loop) { return 1; }
        }
        else if (arg_big)
        {
            if (!run("BigCrush", bbattery_BigCrush) && !arg_loop) { return 1; }
        }
        else
        {
            fprintf(stderr, "Error: No test battery specified\n");
            return usage(argv[0]);
        }

        if (arg_loop) {
            printf("  Total case failure rate: %.2f%% (suspicious %.2f%% unusual: %.2f%%)\n",
                (totalFailed / totalRun) * 100,
                (totalSuspicious / totalRun) * 100,
                (totalUnusual / totalRun) * 100);
        }
    } while (arg_loop);

    printf("\n");
}
