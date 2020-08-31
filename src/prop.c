#include <math.h>

void add(float *coord1, float *coord2) {
    coord1[0] += coord2[0];
    coord1[1] += coord2[1];
}

void subtract(float *coord1, float *coord2) {
    coord1[0] -= coord2[0];
    coord1[1] -= coord2[1];
}

void multiply(float *coord1, float *coord2) {
    coord1[0] *= coord2[0];
    coord1[1] *= coord2[1];
}

void factor(float *coord, float factor) {
    coord[0] *= factor;
    coord[1] *= factor;
}

void divide(float *coord1, float *coord2) {
    coord1[0] /= coord2[0];
    coord1[1] /= coord2[1];
}

void divisor(float *coord, float divisor) {
    coord[0] /= factor;
    coord[1] /= factor;
}

float dist(float *coord1, float *coord2) {
    return sqrt(pow(coord2[0] - coord1[0], 2.0) + pow(coord2[1] - coord1[1], 2.0));
}