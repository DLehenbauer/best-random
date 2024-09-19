ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all:
	make base rng stdin

fetchSrc:
	mkdir -p src
	cd src && \
	wget http://simul.iro.umontreal.ca/testu01/TestU01.zip && \
	unzip TestU01.zip && \
	cd .. && \
	mkdir -p adaptive && \
	cd adaptive && \
	wget http://www.math.sci.hiroshima-u.ac.jp/m-mat/MT/ADAPTIVE/adaptive_crush.zip && \
	unzip adaptive_crush.zip && \
	patch adaptive/adaptive_crush.c < adaptive_crush.c.patch

stdin:
	gcc -std=c99 -Wall -O3 -fomit-frame-pointer -march=native -mtune=native -o TestU01_stdin TestU01_stdin.c adaptive/adaptive_crush.c -Iadaptive -Iinclude -Llib -ltestu01 -lprobdist -lmylib -lm

rng:
	gcc -std=c99 -Wall -O3 -fomit-frame-pointer -march=native -mtune=native -o TestU01_rng TestU01_rng.c main.c ../Rng/rng.c adaptive/adaptive_crush.c -Iadaptive -Iinclude -Llib -ltestu01 -lprobdist -lmylib -lm

pcg:
	gcc -std=c99 -Wall -O3 -fomit-frame-pointer -march=native -mtune=native -o TestU01_rng TestU01_pcg.c main.c generators/pcg_basic.c adaptive/adaptive_crush.c -Iadaptive -Iinclude -Llib -ltestu01 -lprobdist -lmylib -lm

base:
	cd src/TestU01-1.2.3 && \
	./configure --prefix="$(ROOT_DIR)" --build=aarch64-unknown-linux-gnu && \
	make -j 6 && \
	make -j 6 install
	mkdir lib-so
	mv lib/*.so lib-so/.

clean:
	rm -rf TestU01_rng ./bin ./include ./lib-so ./lib ./share
