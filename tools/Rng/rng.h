#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h> 
#include <time.h>

// Seeds that lead to a series of low hamming weight states centered around { x: 0, y: 0, z: 1, w: 0 }.
static uint32_t x = 0x4c24820du;
static uint32_t y = 0x84930822u;
static uint32_t z = 0xc1290042u;
static uint32_t w = 0x09008200u;
static uint32_t s = 0u;

// uint32_t mix(uint32_t a, uint32_t b, uint32_t c) {
//     a += rot(b * 61, 12);
//     a -= rot(c * 23, 23);
//     return a;
// }
// uint32_t hi32() { return mix(x, y, z); } // B+: 0.001004 / 0.001812, PR@128gb
// uint32_t lo32() { return mix(w, z, y); } // B+: 0.002724 / 0.001321, PR@128gb

// uint32_t mix(uint32_t a, uint32_t b, uint32_t c) {   // PR unusual @ 256gb, PR* good at 512gb
//     a += rot(b * 83, 26);
//     a -= rot(c * 17, 26);
//     return a;
// }
// uint32_t hi32() { return mix(x, y, z); } // B+: 0.002528 / 0.002436, PR unusual @ 128gb
// uint32_t lo32() { return mix(w, z, y); } // B+: 0.005516 / 0.001809, 

// uint32_t mix(uint32_t a, uint32_t b) {
//     a -= rot(b * 0x00002ccb, 21);            // len=0xfffec507
//     return a;
// }
// uint32_t hi32() { return mix(x, z - s); }    // BC+: 0.001447 / 0.003091, C+: 0.009630 / 0.004968
// uint32_t lo32() { return mix(w, s - y); }    // BC+: 0.001801 / 0.004413, C+: 0.002421 / 0.002012

const uint32_t S = 0x9e3779b9;

static uint32_t rot(uint32_t v, uint32_t k) { k &= 31; return (v << k) | (v >> (32 - k)); }

uint32_t mix(uint32_t a, uint32_t b) {
    // a -= rot(575 * b, 21);  // len=0xfffd9550 100.00%
    // a -= rot(1057 * b, 27); // len=0xfffc36b3 99.99%
    // a -= rot(123 * b, 26);  // len=0xfffbe958 99.99%
    // a -= rot(567 * b, 3);   // len=0xfff5030c 99.98%
    // a -= rot(995 * b, 31);  // len=0xfff41586 99.98% fail
    // a -= rot(433 * b, 9);   // len=0xfff37585 99.98%
    // a -= rot(1109 * b, 18); // len=0xfff2582a 99.98%
    // a -= rot(1331 * b, 6);  // len=0xfff1d0f1 99.98%
    // a -= rot(1509 * b, 4);  // len=0xffedd1cf 99.97%
    // a -= rot(265 * b, 8);   // len=0xffed1a6d 99.97%
    // a -= rot(665 * b, 11);  // len=0xffeaad40 99.97%
    // a -= rot(721 * b, 10);  // len=0xffe3374c 99.96%
    // a -= rot(1121 * b, 12); // len=0xffdfb9aa 99.95%
    // a -= rot(971 * b, 3);   // len=0xffdf29f9 99.95%
    // a -= rot(953 * b, 9);   // len=0xffdef236 99.95%
    // a -= rot(449 * b, 26);  // len=0xffdc2b4c 99.95%
    // a -= rot(35 * b, 28);   // len=0xffd3cc4d 99.93%
    // a -= rot(1339 * b, 9);  // len=0xffd34c57 99.93%
    // a -= rot(1205 * b, 21); // len=0xffd2a78f 99.93% (strong SC)
    // a -= rot(1241 * b, 15); // len=0xffd1f951 99.93% C+: 0.004812/0.007537, 0.003801/0.002720 U x 2
    // a -= rot(1185 * b, 27); // len=0xffcff11e 99.93%
    // a -= rot(793 * b, 20);  // len=0xffcf7865 99.93%
    // a -= rot(499 * b, 6);   // len=0xffcea955 99.92%
    // a -= rot(759 * b, 17);  // len=0xffce620c 99.92% (strong SC) U x 1
    // a -= rot(905 * b, 16);  // len=0xffcab0c7 99.92% (fail)
    // a -= rot(1013 * b, 31); // len=0xffc9b697 99.92% (fail)
    // a -= rot(1125 * b, 2);  // len=0xffc83301 99.91% (very suspicious)
    // a -= rot(1411 * b, 9);  // len=0xffc52ff7 99.91%
    // a -= rot(963 * b, 30);  // len=0xffc3fdc1 99.91% (fail)
    // a -= rot(943 * b, 25);  // len=0xffc36638 99.91%
    // a -= rot(349 * b, 3);   // len=0xffbbba6e 99.90% (suspicious)
    // a -= rot(1337 * b, 25); // len=0xffb9f2a3 99.89% (SC-)
    // a -= rot(265 * b, 20);  // len=0xffb919ba 99.89%
    // a -= rot(1097 * b, 20); // len=0xffb8e321 99.89%
    // a -= rot(711 * b, 25);  // len=0xffb3dcfe 99.88%
    // a -= rot(407 * b, 22);  // len=0xffb34a05 99.88%
    // a -= rot(1081 * b, 4);  // len=0xffaf43ee 99.88%
    // a -= rot(837 * b, 27);  // len=0xffaf0283 99.88%
    // a -= rot(1413 * b, 21); // len=0xffab986e 99.87%
    // a -= rot(1511 * b, 21); // len=0xffa99dac 99.87% (C-)
    // a -= rot(1107 * b, 9);  // len=0xffa95e8e 99.87%
    // a -= rot(267 * b, 31);  // len=0xffa91c2e 99.87% (fail)
    // a -= rot(103 * b, 16);  // len=0xffa82671 99.87% (fail)
    // a -= rot(219 * b, 11);  // len=0xffa4640c 99.86%
    // a -= rot(809 * b, 25);  // len=0xffa024a0 99.85% (SC-)
    // a -= rot(589 * b, 14);  // len=0xff990821 99.84%
    // a -= rot(1439 * b, 15); // len=0xff9905b2 99.84%
    // a -= rot(1085 * b, 28); // len=0xff93e5f7 99.84% C+ 0.003440 / 0.002028, 0.002325 / 0.006746 1xU
    // a -= rot(1401 * b, 29); // len=0xff93dcef 99.83% (fail)
    // a -= rot(1343 * b, 28); // len=0xff87e4c2 99.82% (fail)
    // a -= rot(439 * b, 15);  // len=0xff871d38 99.82%
    // a -= rot(1087 * b, 8);  // len=0xff8684c0 99.81%
    // a -= rot(417 * b, 9);   // len=0xff84a66f 99.81%
    // a -= rot(785 * b, 27);  // len=0xff806210 99.81%
    // a -= rot(1417 * b, 11); // len=0xff7a2e0f 99.80% (C-)
    // a -= rot(951 * b, 24);  // len=0xff77d146 99.79% (SC-)
    // a -= rot(867 * b, 20);  // len=0xff72e85d 99.78%
    // a -= rot(457 * b, 25);  // len=0xff703c55 99.78%
    // a -= rot(1231 * b, 12); // len=0xff6fdb9f 99.78% (SC-)
    // a -= rot(1507 * b, 11); // len=0xff6fa690 99.78%
    // a -= rot(283 * b, 16);  // len=0xff6f1b67 99.78% (fail)
    // a -= rot(1079 * b, 31); // len=0xff6dd447 99.78% (fail)
    // a -= rot(885 * b, 29);  // len=0xff638a08 99.76%
    // a -= rot(975 * b, 17);  // len=0xff5e52b3 99.75%
    // a -= rot(709 * b, 16);  // len=0xff5d8140 99.75% (fail)
    // a -= rot(699 * b, 24);  // len=0xff5c4e6d 99.75% (fail)
    // a -= rot(777 * b, 9);   // len=0xff5a2ff4 99.75% BC+ 0.001180/0.007396, 0.001223/0.002042, Ux6
    // a -= rot(677 * b, 1);   // len=0xff519d88 99.73% (strong SC, very suspicious)
    // a -= rot(237 * b, 16);  // len=0xff50f562 99.73%
    // a -= rot(1165 * b, 5);  // len=0xff4dcfc7 99.73%
    // a -= rot(463 * b, 23);  // len=0xff46b695 99.72%
    // a -= rot(1055 * b, 19); // len=0xff3fb780 99.71% (suspicious)
    // a -= rot(445 * b, 17);  // len=0xff3c6158 99.70%
    // a -= rot(65 * b, 6);    // len=0xff3af78c 99.70% (suspicious)
    // a -= rot(773 * b, 22);  // len=0xff33d161 99.69% (SC-)
    // a -= rot(501 * b, 28);  // len=0xff317564 99.68%
    // a -= rot(521 * b, 10);  // len=0xff2dba58 99.68% C+: 0.002530/0.003978, 0.011059,0/001345 Ux1
    // a -= rot(1175 * b, 11); // len=0xff2cfdd8 99.68%
    // a -= rot(815 * b, 14);  // len=0xff2c8a57 99.68% C-, Ux1
    // a -= rot(1391 * b, 8);  // len=0xff2c5073 99.68% (mildly suspicious)
    // a -= rot(811 * b, 25);  // len=0xff2c4df0 99.68% C+: 0.002772/0.001585,0.009175/0.005761 Ux1
    // a -= rot(121 * b, 22);  // len=0xff2c26bb 99.68%
    // a -= rot(857 * b, 19);  // len=0xff2a92b4 99.67% (C-, fail)
    // a -= rot(1389 * b, 23); // len=0xff289789 99.67% (C-)
    // a -= rot(1035 * b, 10); // len=0xff26861b 99.67%
    // a -= rot(373 * b, 1);   // len=0xff248c17 99.67%
    // a -= rot(151 * b, 2);   // len=0xff2088d0 99.66%
    // a -= rot(1069 * b, 21); // len=0xff1e7a47 99.66%
    // a -= rot(1137 * b, 6);  // len=0xff1b44c6 99.65%
    // a -= rot(1245 * b, 26); // len=0xff14a0aa 99.64% (mildly suspicious)
    // a -= rot(671 * b, 7);   // len=0xff147c02 99.64%
    // a -= rot(35 * b, 22);   // len=0xff1350f2 99.64% (C-, Ux2)
    // a -= rot(1239 * b, 30); // len=0xff113ce1 99.64% (fail)
    // a -= rot(683 * b, 12);  // len=0xff0e9000 99.63%
    // a -= rot(895 * b, 22);  // len=0xff0c4af5 99.63% C+ 0.011994/0.010215, 0.008090/0.022660 4xU
    // a -= rot(1065 * b, 26); // len=0xff04910f 99.62% C-
    // a -= rot(59 * b, 31);   // len=0xff01ef9a 99.61% (SC-)
    // a -= rot(811 * b, 3);   // len=0xff01bc42 99.61% (fail)
    // a -= rot(1075 * b, 28); // len=0xfefc87fb 99.60%
    // a -= rot(1505 * b, 5);  // len=0xfefa770e 99.60% (fail)
    return a;
}
uint32_t hi32() { return mix(x, z - s); }
uint32_t lo32() { return mix(w, s - y); }

void advance() {
    uint32_t t = x;
    x = y;
    y = z;
    z = w;

    s += S;

    t ^= t << 15;   // x (lo 17b)  0fedcba9 87654321 0....... ........
    t ^= t >> 18;   // x (hi 14b)  ........ ........ ..fedcba 98765432
    t ^= w << 11;   // w (lo 21b)  43210fed cba98765 43210... ........           

    w = t;
}
