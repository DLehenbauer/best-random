ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

all:
	cd src/gjrand.4.3.0.0/src && \
	./compile && \
	cd ../testunif/src && \
	./compile

fetchSrc:
	mkdir -p src
	cd src && \
	wget -O gjrand.4.3.0.tar.bz2 https://sourceforge.net/projects/gjrand/files/gjrand/gjrand.4.3.0/gjrand.4.3.0.tar.bz2/download && \
	tar xvfj gjrand.4.3.0.tar.bz2

clean:
	rm -rf ./src RNG_test
