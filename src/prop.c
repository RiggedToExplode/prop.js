#include <math.h>
#include <emscripten/emscripten.h>

void EMSCRIPTEN_KEEPALIVE add(float *coord1, float *coord2) {
    coord1[0] += coord2[0];
    coord1[1] += coord2[1];
}

void EMSCRIPTEN_KEEPALIVE subtract(float *coord1, float *coord2) {
    coord1[0] -= coord2[0];
    coord1[1] -= coord2[1];
}

void EMSCRIPTEN_KEEPALIVE multiply(float *coord1, float *coord2) {
    coord1[0] *= coord2[0];
    coord1[1] *= coord2[1];
}

void EMSCRIPTEN_KEEPALIVE factor(float *coord, float factor) {
    coord[0] *= factor;
    coord[1] *= factor;
}

void EMSCRIPTEN_KEEPALIVE divide(float *coord1, float *coord2) {
    coord1[0] /= coord2[0];
    coord1[1] /= coord2[1];
}

void EMSCRIPTEN_KEEPALIVE divisor(float *coord, float divisor) {
    coord[0] /= divisor;
    coord[1] /= divisor;
}

float EMSCRIPTEN_KEEPALIVE dist(float *coord1, float *coord2) {
    return sqrt(pow(coord2[0] - coord1[0], 2.0) + pow(coord2[1] - coord1[1], 2.0));
}