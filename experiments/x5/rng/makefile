# Define the RNG executable path as absolute path based on makefile location
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
RNG_EXEC := $(MAKEFILE_DIR)rng
COMMON_DIR := $(MAKEFILE_DIR)../../../candidates/common/

# Define the tools directory path
TOOLS_DIR := $(MAKEFILE_DIR)../../../tools

# Define the RNG invocation command with buffering
RNG := stdbuf -o 4K $(RNG_EXEC)

all:
	gcc -std=c99 -Wall -Werror -O3 -fomit-frame-pointer -march=native -mtune=native -o $(RNG_EXEC) $(COMMON_DIR)main.c -I $(MAKEFILE_DIR)

debug:
	gcc -std=c99 -Wall -Werror -g3 -O0 -DDEBUG -fno-omit-frame-pointer -march=native -mtune=native -o $(RNG_EXEC) $(COMMON_DIR)main.c -I $(MAKEFILE_DIR)

pr12: all
	$(RNG) | $(TOOLS_DIR)/PractRand/RNG_test stdin -multithreaded -te 1 -tf 2 -tlmax 8192PB

hwd: all
	$(RNG) | $(TOOLS_DIR)/hwd/hwd

mod3: all
	$(RNG) | $(TOOLS_DIR)/GJRand/src/gjrand.4.3.0.0/testunif/bin/mod3 --progress

pmcp: all
	cd $(TOOLS_DIR)/GJRand/src/gjrand.4.3.0.0/testunif && \
	$(RNG) | ./pmcp --small

#
# Create targets for TestU01 variants
#

# Create a TestU01 target for a given name and options
define testu01_target
$(1): all
	cd $(TOOLS_DIR)/TestU01 && \
	$(RNG) | ./TestU01_rng $(2)
endef

# Create all bit selection/ordering variants for a given TestU01 suite
define testu01_variants
$(eval $(call testu01_target,$(1),$(2)))
$(eval $(call testu01_target,$(1)r,$(2) -r))
$(eval $(call testu01_target,$(1)l,$(2) -l))
$(eval $(call testu01_target,$(1)lr,$(2) -l -r))
$(eval $(call testu01_target,$(1)h,$(2) -h))
$(eval $(call testu01_target,$(1)hr,$(2) -h -r))
endef

# Define targets for all TestU01 suites and their variants
$(eval $(call testu01_variants,sc,-s))	# SmallCrush: sc, scl, sclr, sch, schr
$(eval $(call testu01_variants,c,-c)) 	# Crush: c, cl, clr, ch, chr
$(eval $(call testu01_variants,bc,-b))	# BigCrush: bc, bcl, bclr, bch, bchr  
$(eval $(call testu01_variants,ac,-a))	# AdaptiveCrush: ac, acl, aclr, ach, achr

clean:
	rm -f $(RNG_EXEC)
