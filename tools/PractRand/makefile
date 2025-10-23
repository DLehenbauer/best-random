ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all:
	make rng

rng:
	cd src/PractRand && \
	g++ -std=c++14 -o RNG_test tools/RNG_test.cpp src/*.cpp src/RNGs/*.cpp src/RNGs/other/*.cpp -O3 -fomit-frame-pointer -march=native -mtune=native -Iinclude -pthread && \
	cp RNG_test ../..

fetchSrc:
	mkdir -p src
	cd src && \
	git clone https://github.com/DLehenbauer/PractRand.git

clean:
	rm -rf ./src RNG_test
