ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all:
	mkdir -p src
	cd src && \
	curl -OL https://downloads.sourceforge.net/project/pracrand/PractRand_0.94.zip && \
	unzip -q PractRand_0.94.zip && \
	cd PractRand_094 && \
	g++ -std=c++14 -c src/*.cpp src/RNGs/*.cpp src/RNGs/other/*.cpp -O3 -fomit-frame-pointer -march=native -mtune=native -Iinclude -pthread && \
	ar rcs libPractRand.a *.o && \
	rm *.o && \
	g++ -std=c++14 -o RNG_test tools/RNG_test.cpp libPractRand.a -O3 -fomit-frame-pointer -march=native -mtune=native -Iinclude -pthread && \
	cp RNG_Test ../..

clean:
	rm -rf ./src
