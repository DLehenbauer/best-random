ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all:
	gcc -std=c99 -Wall -O3 -fomit-frame-pointer -march=native -mtune=native -o TestU01_stdin TestU01_stdin.c -Iinclude -Llib -ltestu01 -lprobdist -lmylib -lm

testu01:
	mkdir -p src
	cd src && \
	curl -OL http://simul.iro.umontreal.ca/testu01/TestU01.zip && \
	unzip TestU01.zip && \
	cd TestU01-1.2.3 && \
	./configure --prefix="$(ROOT_DIR)" && \
	make -j 6 && \
	make -j 6 install
	mkdir lib-so
	mv lib/*.so lib-so/.

clean:
	rm -rf ./src
