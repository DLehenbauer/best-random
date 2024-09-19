#include <assert.h>
#include <math.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <time.h>
#include "TestU01.h"
#include "adaptive/adaptive_crush.h"
#include "common.h"

extern unif01_Gen *createGenerator(bool high32, bool low32, bool reversed);

int usage(char *name)
{
    printf("\n");
    printf("Usage: %s [-s|-c|-b] [-h] [-l] [-r] [-v] [-x <loopcount>]\n", name);
    printf("  -s = SmallCrush\n");
    printf("  -c = Crush\n");
    printf("  -b = BigCrush\n");
    printf("  -a = AdaptiveCrush\n");
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

uint32_t remainingIterations = 1;
double testToTotalPVal[201] = {0};
uint32_t testToTotalFailures[201] = {0};
double totalIterationsRun = 0;
double totalIterationsFailed = 0;
double totalCasesRun = 0;
double totalCasesUnusual = 0;
double totalCasesSuspicious = 0;
double totalCasesFailed = 0;

double computeDelta(double pVal) {
    return pVal < 0.5
        ? pVal
        : 1.0 - pVal;
}

double getDelta(uint32_t index) {
    return computeDelta(bbattery_pVal[index]);
}

double getAvg(uint32_t index) {
    return testToTotalPVal[index] / totalIterationsRun;
}

double getAvgDelta(uint32_t index) {
    return computeDelta(getAvg(index));
}

struct sorted_result_t
{
    uint32_t index;
};

static int sorted_result_cmp_avg(const void *left, const void *right)
{
    const struct sorted_result_t *leftResult = left, *rightResult = right;

    double leftAvg  = getAvgDelta(leftResult->index);
    double rightAvg = getAvgDelta(rightResult->index);

    return leftAvg < rightAvg
               ? 1
               : leftAvg > rightAvg
                     ? -1
                     : 0;
}

static int sorted_result_cmp_delta(const void *left, const void *right)
{
    const struct sorted_result_t *leftResult = left, *rightResult = right;

    double leftDelta  = getDelta(leftResult->index);
    double rightDelta = getDelta(rightResult->index);

    return leftDelta < rightDelta
               ? 1
               : leftDelta > rightDelta
                     ? -1
                     : 0;
}

unif01_Gen *gen = NULL;

void displayResults(char* name, struct sorted_result_t* results, bool all) {
    int numFailed     = 0;
    int numSuspicious = 0;
    int numUnusual    = 0;

    bool printHeader = true;

    for (int i = 0; i < bbattery_NTests; i++)
    {
        uint32_t index = results[i].index;
        double delta = getDelta(index);
        bool testFailed     = delta < gofw_Suspectp;
        bool testSuspicious = !testFailed && delta < 0.0025;
        bool testUnusual    = !testSuspicious && delta < 0.01;

        if (testFailed)
        {
            testToTotalFailures[index]++;
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
        else if (!swrite_Basic && !all)
        {
            continue;
        }

        if (printHeader) {
            printf("    avg p     fail  test                           p\n");
            printHeader = false;
        }

        printf("    %f  %4d  %-30s %f%-15s\n",
            getAvgDelta(index),
            testToTotalFailures[index],
            bbattery_TestNames[index],
            delta,
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

    totalCasesRun += bbattery_NTests;
    totalCasesFailed += numFailed;
    totalCasesSuspicious += numSuspicious;
    totalCasesUnusual += numUnusual;

    printf("\n%s %s: Passed %d/%d iterations (%.2f%%)%s\n",
        gen->name,
        name,
        (uint32_t) (totalIterationsRun - totalIterationsFailed),
        (uint32_t) totalIterationsRun,
        ((totalIterationsRun - totalIterationsFailed) / totalIterationsRun) * 100,
        numFailed == 0
            ? ""
            : " - FAIL!");

    printf("  Total case failure rate: %.2f%% (suspicious: %.2f%%, unusual: %.2f%%)\n",
        (totalCasesFailed / totalCasesRun) * 100,
        (totalCasesSuspicious / totalCasesRun) * 100,
        (totalCasesUnusual / totalCasesRun) * 100);
}

int run(char* name, void (*battery)(unif01_Gen *gen))
{
    totalIterationsRun++;

    gen = createGenerator(arg_hi, arg_lo, arg_rev);

    if (gen == NULL)
    {
        fprintf(stderr, "Error: Must specify high (-h) or low (-l)\n");
        return 1;
    }

    battery(gen);
    
    struct sorted_result_t* results = malloc(bbattery_NTests * sizeof(struct sorted_result_t));
    
    for (int i = 0; i < bbattery_NTests; i++)
    {
        results[i].index = i;
        testToTotalPVal[i] += bbattery_pVal[i];
    }

    qsort(results, bbattery_NTests, sizeof *results, sorted_result_cmp_delta);
    displayResults(name, results, /* all: */ false);

    // If this is the last iteration resort the results by avg-p and display all tests.
    if (remainingIterations == 1) {
        qsort(results, bbattery_NTests, sizeof *results, sorted_result_cmp_avg);
        displayResults(name, results, /* all: */ true);
    }

    free(results);    
    unif01_DeleteExternGenBits(gen);
    return 0;
}

int main(int argc, char *argv[])
{
    swrite_Basic = FALSE;
    bool arg_small = false;
    bool arg_medium = false;
    bool arg_big = false;
    bool arg_adaptive = false;

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
        else if (strcmp(argv[i], "-a") == 0)
        {
            arg_adaptive = true;
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

    init_seed(0);

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
        else if (arg_adaptive)
        {
            run("AdaptiveCrush", bbattery_Adaptive_Crush);
        }
        else
        {
            fprintf(stderr, "\nError: Must specify a test battery [-s|-c|-b].\n");
            return usage(argv[0]);
        }
    }
    while ((--remainingIterations) > 0);

    printf("\n");
    return totalIterationsFailed > 0 ? 1 : 0;
}
