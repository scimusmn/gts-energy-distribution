//Library for monitoring an analog input that reports change in value via serial.

#include "Arduino.h"
#include "arduino-base/Libraries/SerialController.hpp"

// ensure this library description is only included once
#ifndef SerialAnalog_h
#define SerialAnalog_h

class SerialAnalog
{
private:
    SerialController *serialController;
    int pin;
    char *message;
    int percentLastSent;
    int percent;

public:
    SerialAnalog(SerialController *_serialC, char _message[30], int _p)
    {
        pin = _p;
        message = _message;
        serialController = _serialC;
        pinMode(pin, INPUT);
    }

    void SerialAnalog::listener()
    {
        percent = analogRead(pin);
        percent = map(percent, 100, 920, 0, 100);
        percent = constrain(percent, 0, 100);
        if (percent != percentLastSent)
        {
            percentLastSent = percent;
            serialController->sendMessage(message, percent);
        }
    }

    void sendPercent()
    {
        serialController->sendMessage(message, percent);
    }
};
#endif