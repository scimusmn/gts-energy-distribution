#include "Arduino.h"
#include <Adafruit_NeoPixel.h>

// ensure this library description is only included once
#ifndef Lightbar_header
#define Lightbar_header

class LightBar
{

public:
    LightBar(Adafruit_NeoPixel *, int, char[20], int, int, int);
    void check(char *, char *);

private:
    void updateLightBar(int, int); // first pixel, percent 0 - 100
    Adafruit_NeoPixel *pixels;
    int firstPixel;
    char *triggerMsg;
    int red;
    int green;
    int blue;
};

#endif