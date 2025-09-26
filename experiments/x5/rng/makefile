# Define the RNG executable path as absolute path based on makefile location
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
RNG_EXEC := $(MAKEFILE_DIR)rng

# Define the tools directory path
TOOLS_DIR := ../../../tools

# Define the RNG invocation command with buffering
RNG := stdbuf -o 4K $(RNG_EXEC)

all:
	gcc -std=c99 -Wall -Werror -O3 -fomit-frame-pointer -march=native -mtune=native -o $(RNG_EXEC) main.c

debug:
	gcc -std=c99 -Wall -Werror -g3 -O0 -DDEBUG -fno-omit-frame-pointer -march=native -mtune=native -o $(RNG_EXEC) main.c

test: all
	$(RNG) | $(TOOLS_DIR)/PractRand/RNG_test stdin -multithreaded -tf 2 -tlmax 8192PB

hwd: all
	$(RNG) | $(TOOLS_DIR)/hwd/hwd

mod3: all
	$(RNG) | $(TOOLS_DIR)/GJRand/src/gjrand.4.3.0.0/testunif/bin/mod3 --progress

pmcp: all
	cd $(TOOLS_DIR)/GJRand/src/gjrand.4.3.0.0/testunif && \
	$(RNG) | ./pmcp --small

sc: all
	cd $(TOOLS_DIR)/TestU01 && \
	$(RNG) | ./TestU01_rng -s

scr: all
	cd $(TOOLS_DIR)/TestU01 && \
	$(RNG) | ./TestU01_rng -s -r

clean:
	rm -f $(RNG_EXEC)
