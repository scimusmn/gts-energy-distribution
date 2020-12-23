#include "Arduino.h"
#include "LightBar.h"
#include <Adafruit_NeoPixel.h>

LightBar::LightBar(Adafruit_NeoPixel *_pixels, int _firstPixel, char _triggerMsg[20], int _red, int _green, int _blue)
{
    firstPixel = _firstPixel;
    triggerMsg = _triggerMsg;
    this->pixels = _pixels;
    red = _red;
    green = _green;
    blue = _blue;
}

// Public Methods //////////////////////////////////////////////////////////////
void LightBar::check(char *message, char *value)
{
    if (strcmp(message, triggerMsg) == 0)
    {
        Serial.print("Match - ");
        Serial.print(triggerMsg);
        Serial.print(" === ");
        Serial.print(message);
        Serial.print(" - ");
        Serial.println(firstPixel);
        updateLightBar(firstPixel, atoi(value));
    }
}

// Private Methods //////////////////////////////////////////////////////////////
void LightBar::updateLightBar(int first_pixel, int percent)
{
    Serial.print("updateLightBar - ");
    Serial.print(first_pixel);
    Serial.print(" - ");
    Serial.println(percent);
    percent = constrain(percent, 0, 100);
    int bar = percent * 2;
    for (int i = 0; i < 8; i++)
    {
        if (bar > 25)
        {
            pixels->setPixelColor(first_pixel + i, pixels->Color(0, 25, 0));
            bar = bar - 25;
        }
        else
        {
            pixels->setPixelColor(first_pixel + i, pixels->Color(0, bar, 0));
            bar = 0;
        }
    }
    pixels->show();
}
