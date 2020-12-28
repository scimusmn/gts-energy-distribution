#include "Arduino.h"
#include "LightBar.h"
#include <Adafruit_NeoPixel.h>

LightBar::LightBar(Adafruit_NeoPixel *_pixels, int _firstPixel, char _triggerMsg[20], int _red, int _green, int _blue)
{
    firstPixel = _firstPixel;
    triggerMsg = _triggerMsg;
    pixelsRef = _pixels;
    red = _red;
    green = _green;
    blue = _blue;
}

// Public Methods //////////////////////////////////////////////////////////////
bool LightBar::check(char *message, char *value)
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
        return true;
    }
    else
    {
        return false;
    }
}

// Private Methods //////////////////////////////////////////////////////////////
void LightBar::updateLightBar(int first_pixel, int percent)
{
    Serial.print("updateLightBar - ");
    Serial.print(first_pixel);
    Serial.print(" - ");
    Serial.println(percent);
    int bar = constrain(percent, 0, 100) * 2;
    for (int i = 0; i < 8; i++)
    {
        if (bar > 25)
        {
            pixelsRef->setPixelColor(first_pixel + i, pixelsRef->Color(0, 25, 0));
            bar = bar - 25;
        }
        else
        {
            pixelsRef->setPixelColor(first_pixel + i, pixelsRef->Color(0, bar, 0));
            bar = 0;
        }
    }

    pixelsRef->show();
}
