#include <math.h>

void addCoords(float *coord1, float *coord2) {
    coord1[0] += coord2[0];
    coord1[1] += coord2[1];
}

void subCoords(float *coord1, float *coord2) {
    coord1[0] -= coord2[0];
    coord1[1] -= coord2[1];
}

void multCoords(float *coord1, float *coord2) {
    coord1[0] *= coord2[0];
    coord1[1] *= coord2[1];
}

void multCoord(float *coord, float factor) {
    coord[0] *= factor;
    coord[1] *= factor;
}

void divCoords(float *coord1, float *coord2) {
    coord1[0] /= coord2[0];
    coord1[1] /= coord2[1];
}

void divCoord(float *coord, float factor) {
    coord[0] /= factor;
    coord[1] /= factor;
}

float dist(float *coord1, float *coord2) {
    return sqrt(pow(coord2[0] - coord1[0], 2.0) + pow(coord2[1] - coord1[1], 2.0));
}