//Library for monitoring a digital input that reports it's state via serial.

#include "Arduino.h"
#include "arduino-base/Libraries/SerialController.hpp"

// ensure this library description is only included once
#ifndef SerialButton_h
#define SerialButton_h

class SerialButton
{
private:
    SerialController *serialController;
    char *message;
    int pin;
    int debounce;
    bool state;
    bool stateLastFired;
    unsigned long lastStateChangeMillis;

public:
    SerialButton(SerialController *_serialC, char _message[30], int _p, int _debounce = 20)
    {
        pin = _p;
        message = _message;
        serialController = _serialC;
        debounce = _debounce;
        pinMode(_p, INPUT_PULLUP);
        lastStateChangeMillis = 0;
        stateLastFired = state = true;
    }

    bool getState()
    {
        return stateLastFired;
    }

    void listener()
    {
        if (digitalRead(pin) != state) // if the state changed
        {
            state = !state;
            lastStateChangeMillis = millis();
        }

        if (((millis() - lastStateChangeMillis) > debounce) && stateLastFired != state)
        {
            stateLastFired = state;
            serialController->sendMessage(message, !state);
        }
    }
};

#endif
