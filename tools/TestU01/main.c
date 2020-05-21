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
    printf("Usage: %s [-s|-c|-b] [-h] [-l] [-r] [-v] [-x <loopcount>]\n", name);
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

uint32_t remainingIterations = 1;
uint32_t totalIterationsRun = 0;
uint32_t totalIterationsFailed = 0;
double totalCasesRun = 0;
double totalCasesUnusual = 0;
double totalCasesSuspicious = 0;
double totalCasesFailed = 0;
unif01_Gen *gen = NULL;

bool run(char* name, void (*battery)(unif01_Gen *gen))
{
    totalIterationsRun++;

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

    if (numFailed > 0) {
        totalIterationsFailed++;
    }

    printf("\n%s %s: Passed %d/%d iterations%s\n",
        gen->name,
        name,
        totalIterationsRun - totalIterationsFailed,
        totalIterationsRun,
        numFailed == 0
            ? ""
            : " - FAIL!");

    totalCasesRun += bbattery_NTests;
    totalCasesFailed += numFailed;
    totalCasesSuspicious += numSuspicious;
    totalCasesUnusual += numUnusual;

    free(results);    
    unif01_DeleteExternGenBits(gen);

    return numFailed == 0;
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
        else if (strcmp(argv[i], "-x") == 0)
        {
            if (++i < argc)
            {
                if (sscanf (argv[i], "%i", &remainingIterations) != 1)
                {
                    fprintf(stderr, "\nError: -x must be followed by a loop count, but got non-integer '%s'.\n", argv[i]);
                    return usage(argv[0]);
                }
            }
            else
            {
                fprintf(stderr, "\nError: -x must be followed by a loop count.\n");
                return usage(argv[0]);
            }
        }
        else
        {
            fprintf(stderr, "\nError: Invalid argument '%s'.\n", argv[i]);
            return usage(argv[0]);
        }
    }

    do
    {
        if (arg_small)
        {
            run("SmallCrush", bbattery_SmallCrush);
        }
        else if (arg_medium)
        {
            run("Crush", bbattery_Crush);
        }
        else if (arg_big)
        {
            run("BigCrush", bbattery_BigCrush);
        }
        else
        {
            fprintf(stderr, "\nError: Must specify a test battery [-s|-c|-b].\n");
            return usage(argv[0]);
        }

        printf("  Total case failure rate: %.2f%% (suspicious %.2f%% unusual: %.2f%%)\n",
            (totalCasesFailed / totalCasesRun) * 100,
            (totalCasesSuspicious / totalCasesRun) * 100,
            (totalCasesUnusual / totalCasesRun) * 100);
    }
    while ((--remainingIterations) > 0);

    printf("\n");
    return totalIterationsFailed > 0 ? 1 : 0;
}
