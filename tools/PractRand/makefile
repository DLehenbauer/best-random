ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all:
	make base rng

base:
	cd src/PractRand && \
	g++ -std=c++14 -c src/*.cpp src/RNGs/*.cpp src/RNGs/other/*.cpp -O3 -fomit-frame-pointer -march=native -mtune=native -Iinclude -pthread && \
	ar rcs libPractRand.a *.o && \
	rm *.o

rng:
	cd src/PractRand && \
	cp ../../RNG_test.cpp ./tools/ && \
	g++ -std=c++14 -o RNG_test tools/RNG_test.cpp ../../../Rng/rng.c libPractRand.a -O3 -fomit-frame-pointer -march=native -mtune=native -Iinclude -pthread && \
	cp RNG_test ../..

fetchSrc:
	mkdir -p src
	cd src && \
	git clone https://github.com/DLehenbauer/PractRand.git

clean:
	rm -rf ./src RNG_test
