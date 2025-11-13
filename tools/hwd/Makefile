all:
	gcc -std=c99 -Wall -Werror -O3 -fomit-frame-pointer -march=native -mtune=native -DHWD_BITS=32 -o hwd32 hwd.c -lm
	gcc -std=c99 -Wall -Werror -O3 -fomit-frame-pointer -march=native -mtune=native -DHWD_BITS=64 -o hwd64 hwd.c -lm

clean:
	rm ./hwd32 ./hwd64
