all:
	gcc -std=c99 -Wall -Werror -O3 -fomit-frame-pointer -march=native -mtune=native -o rng main.c

test: all
	stdbuf -oL ./rng | ../../../tools/PractRand/RNG_test stdin -multithreaded -tf 2 -tlmax 8192PB

hwd: all
	stdbuf -oL ./rng | ../../../tools/hwd/hwd

mod3: all
	stdbuf -oL ./rng | ../../../tools/GJRand/src/gjrand.4.3.0.0/testunif/bin/mod3 --progress

pmcp: all
	cd ../../../tools/GJRand/src/gjrand.4.3.0.0/testunif && \
	stdbuf -oL ../../../../../experiments/x4/rng/rng | ./pmcp --small

clean:
	rm -f ./rng
