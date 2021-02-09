//**************************************************************//
//  Component: Energy Distribution                              //
//  Project: Gateway to Science                                 //
//  Author  : Joe Meyer                                         //
//  Date    : 11/24/2020                                        //
//  Version : 2.0                                               //
//  Description : Control Panel sends events to React           //
//****************************************************************
#include <Adafruit_NeoPixel.h>

#include "SerialAnalog.h"
#include "SerialButton.h"
#include "arduino-base/Libraries/SerialController.hpp"

// Pin assignments
const int neopixel_pin = 6;
const int start_btn_pin = 5;
const int start_btn_LED_pin = 7;
const int shift_in_latch_pin = 4;
const int shift_in_data_pin = 3;
const int shift_in_clock_pin = 2;
const int hydro_1_input_pin = A0;
const int hydro_2_input_pin = A1;
const int hydro_3_input_pin = A2;
const int gas1_btn_up_pin = 9;
const int gas1_btn_down_pin = 10;
const int gas2_btn_up_pin = 11;
const int gas2_btn_down_pin = 12;

SerialController serialController;
const long baudrate = 115200;

const char str_1[] PROGMEM = "coal-1-jack";     // shift in board 1
const char str_2[] PROGMEM = "coal-2-jack";     // 2
const char str_3[] PROGMEM = "coal-3-jack";     // 3
const char str_4[] PROGMEM = "coal-4-jack";     // 4
const char str_5[] PROGMEM = "coal-5-jack";     // 5
const char str_6[] PROGMEM = "coal-6-jack";     // 6
const char str_7[] PROGMEM = "gas-1-jack";      // 7
const char str_8[] PROGMEM = "gas-2-jack";      // 8
const char str_9[] PROGMEM = "hydro-1-jack";    // 9
const char str_10[] PROGMEM = "hydro-2-jack";   // 10
const char str_11[] PROGMEM = "solar-1-jack";   // 11
const char str_12[] PROGMEM = "solar-2-jack";   // 12
const char str_13[] PROGMEM = "solar-3-jack";   // 13
const char str_14[] PROGMEM = "wind-1-jack";    // 14
const char str_15[] PROGMEM = "wind-2-jack";    // 15
const char str_16[] PROGMEM = "wind-3-jack";    // 16
const char str_17[] PROGMEM = "coal-1-switch";  // 17
const char str_18[] PROGMEM = "coal-2-switch";  // 18
const char str_19[] PROGMEM = "coal-3-switch";  // 19
const char str_20[] PROGMEM = "coal-4-switch";  // 20

// Table to refer to strings.
const char *const string_table[] PROGMEM = {
    str_1,  str_2,  str_3,  str_4,  str_5,  str_6,  str_7,
    str_8,  str_9,  str_10, str_11, str_12, str_13, str_14,
    str_15, str_16, str_17, str_18, str_19, str_20};

char buffer[15];

// // message associated with the state of each shift in bit.
// char *shiftInStrings[] = {
//     "coal-1-jack",    // 1
//     "coal-2-jack",    // 2
//     "coal-3-jack",    // 3
//     "coal-4-jack",    // 4
//     "gas-1-jack",     // 5
//     "gas-2-jack",     // 6
//     "gas-3-jack",     // 7
//     "gas-4-jack",     // 8
//     "hydro-1-jack",   // 9
//     "hydro-2-jack",   // 10
//     "hydro-3-jack",   // 11
//     "hydro-4-jack",   // 12
//     "wind-1-jack",    // 13
//     "wind-2-jack",    // 14
//     "wind-3-jack",    // 15
//     "wind-4-jack",    // 16
//     "solar-1-jack",   // 17
//     "solar-2-jack",   // 18
//     "solar-3-jack",   // 19
//     "solar-4-jack",   // 20
//     "coal-1-switch",  // 21
//     "coal-2-switch",  // 22
//     "coal-3-switch",  // 23
//     "coal-4-switch",  // 24
// };

long cableStates, prevCableStates;

// Declare NeoPixel strip object for bar graphs:
Adafruit_NeoPixel pixels(95, neopixel_pin, NEO_GRB + NEO_KHZ800);

// Array of buttons
int NUMBER_OF_BUTTONS = 5;
SerialButton buttons[] = {
    SerialButton(&serialController, "start-button", start_btn_pin),
    SerialButton(&serialController, "gas-1-button-down", gas1_btn_down_pin),
    SerialButton(&serialController, "gas-1-button-up", gas1_btn_up_pin),
    SerialButton(&serialController, "gas-2-button-down", gas2_btn_down_pin),
    SerialButton(&serialController, "gas-2-button-up", gas2_btn_up_pin)};

// Array of levers
int NUMBER_OF_LEVERS = 3;
SerialAnalog levers[] = {
    SerialAnalog(&serialController, "hydro-1-lever", hydro_1_input_pin, 50),
    SerialAnalog(&serialController, "hydro-2-lever", hydro_2_input_pin, 50),
    SerialAnalog(&serialController, "hydro-3-lever", hydro_3_input_pin, 50)};

void setup() {
  // Ensure Serial Port is open and ready to communicate
  serialController.setup(baudrate, &onParse);

  // define pin modes
  pinMode(start_btn_LED_pin, OUTPUT);
  pinMode(shift_in_latch_pin, OUTPUT);
  pinMode(shift_in_clock_pin, OUTPUT);
  pinMode(shift_in_data_pin, INPUT);

  pixels.begin();
  pixels.clear();
  pixels.show();
}

void loop() {
  for (int i = 0; i < NUMBER_OF_LEVERS; i++) {
    levers[i].listener();
  }
  updateJacksSwitches();
  for (int i = 0; i < NUMBER_OF_BUTTONS; i++) {
    buttons[i].listener();
  }
  serialController.update();
}

void updateJacksSwitches() {
  // Pulse the latch pin:
  // set it to 1 to collect parallel data
  digitalWrite(shift_in_latch_pin, 1);
  // set it to 1 to collect parallel data, wait
  delayMicroseconds(20);
  // set it to 0 to transmit data serially
  digitalWrite(shift_in_latch_pin, 0);

  byte statesIn;
  // while the shift register is in serial mode
  // collect each shift register into a byte
  // the register attached to the chip comes in first
  statesIn = shiftIn(shift_in_data_pin, shift_in_clock_pin);
  cableStates = statesIn;
  statesIn = shiftIn(shift_in_data_pin, shift_in_clock_pin);
  cableStates = cableStates << 8;
  cableStates = cableStates | statesIn;

  statesIn = shiftIn(shift_in_data_pin, shift_in_clock_pin);
  cableStates = cableStates << 8;
  cableStates = cableStates | statesIn;

  statesIn = shiftIn(shift_in_data_pin, shift_in_clock_pin);
  cableStates = cableStates << 8;
  cableStates = cableStates | statesIn;

  if (prevCableStates != cableStates)  // if the states changed...
  {
    long mask = 1;                // create a mask
    for (int n = 0; n < 24; n++)  // iterate through each bit
    {
      // check if the bit changed since last state change.
      if ((mask & prevCableStates) != (mask & cableStates)) {
        // jack pin is high (not connected)
        if (mask & cableStates) {
          // Necessary casts and dereferencing.
          strcpy_P(buffer, (char *)pgm_read_word(&(string_table[n])));
          serialController.sendMessage(buffer, "1");  // cable is removed
        }

        else {
          // Necessary casts and dereferencing.
          strcpy_P(buffer, (char *)pgm_read_word(&(string_table[n])));
          serialController.sendMessage(buffer, "0");  // cable is inserted
        }
      }

      mask = mask << 1;  // shift the mask to check the next bit
    }
    prevCableStates = cableStates;
  }
}

byte shiftIn(int myDataPin, int myClockPin) {
  int i;
  int temp = 0;
  int pinState;
  byte myDataIn = 0;

  pinMode(myClockPin, OUTPUT);
  pinMode(myDataPin, INPUT);

  for (i = 7; i >= 0; i--) {
    digitalWrite(myClockPin, 0);
    delayMicroseconds(0.2);
    temp = digitalRead(myDataPin);
    if (temp) {
      pinState = 1;
      // set the bit to 0 no matter what
      myDataIn = myDataIn | (1 << i);
    } else {
      pinState = 0;
    }
    digitalWrite(myClockPin, 1);
  }
  return myDataIn;
}

// this function will run when serialController reads new data
void onParse(char *message, char *value) {
  if (strcmp(message, "start-button-light") == 0)
    digitalWrite(start_btn_LED_pin, atoi(value));

  else if (strcmp(message, "coal-1-light") == 0)
    lightPixel(0, value);
  else if (strcmp(message, "coal-2-light") == 0)
    lightPixel(1, value);
  else if (strcmp(message, "coal-3-light") == 0)
    lightPixel(2, value);
  else if (strcmp(message, "coal-4-light") == 0)
    lightPixel(3, value);
  else if (strcmp(message, "coal-5-light") == 0)
    lightPixel(4, value);
  else if (strcmp(message, "coal-6-light") == 0)
    lightPixel(5, value);

  else if (strcmp(message, "gas-1-light-bar") == 0)
    lightBarGraph(6, atoi(value));  // value of first pixel to be lit.
  else if (strcmp(message, "gas-2-light-bar") == 0)
    lightBarGraph(14, atoi(value));  // value of first pixel to be lit.
  else if (strcmp(message, "gas-3-light-bar") == 0)
    lightBarGraph(22, atoi(value));  // value of first pixel to be lit.

  else if (strcmp(message, "hydro-1-light-bar") == 0)
    lightBarGraph(30, atoi(value));  // value of first pixel to be lit.
  else if (strcmp(message, "hydro-2-light-bar") == 0)
    lightBarGraph(38, atoi(value));  // value of first pixel to be lit.

  else if (strcmp(message, "solar-1-light-bar") == 0)
    lightBarGraph(46, atoi(value));  // value of first pixel to be lit.
  else if (strcmp(message, "solar-2-light-bar") == 0)
    lightBarGraph(54, atoi(value));  // value of first pixel to be lit.
  else if (strcmp(message, "solar-3-light-bar") == 0)
    lightBarGraph(62, atoi(value));  // value of first pixel to be lit.

  else if (strcmp(message, "wind-1-light-bar") == 0)
    lightBarGraph(70, atoi(value));  // value of first pixel to be lit.
  else if (strcmp(message, "wind-2-light-bar") == 0)
    lightBarGraph(78, atoi(value));  // value of first pixel to be lit.
  else if (strcmp(message, "wind-3-light-bar") == 0)
    lightBarGraph(86, atoi(value));  // value of first pixel to be lit.

  else if (strcmp(message, "get-all-states") == 0)  // TODO
  {
    prevCableStates = ~prevCableStates;
    for (int i = 0; i < NUMBER_OF_LEVERS; i++) {
      levers[i].sendPercent();
    }
  }

  else if (strcmp(message, "neopixels-show") == 0)
    pixels.show();

  else if (strcmp(message, "wake-arduino") == 0 && strcmp(value, "1") == 0) {
    // you must respond to this message, or else
    // stele will believe it has lost connection to the arduino
    serialController.sendMessage("arduino-ready", "1");
  } else {
    // helpfully alert us if we've sent something wrong :)
    serialController.sendMessage(message, "X");
  }
}

void lightPixel(int pixel_index, char *status) {
  if (strcmp(status, "on") == 0)
    pixels.setPixelColor(pixel_index, pixels.Color(0, 75, 0));
  else if (strcmp(status, "warming") == 0)
    pixels.setPixelColor(pixel_index, pixels.Color(40, 10, 0));
  else if (strcmp(status, "off") == 0)
    pixels.setPixelColor(pixel_index, pixels.Color(0, 0, 0));
}

// displays an int, 0-100 on 8 neopixels given a starting pixel.
void lightBarGraph(int first_pixel, int percent) {
  percent = constrain(percent, 0, 100);
  int bar = percent * 2;
  for (int i = 0; i < 8; i++) {
    if (bar > 25) {
      pixels.setPixelColor(first_pixel + i, pixels.Color(0, 25, 0));
      bar = bar - 25;
    } else {
      pixels.setPixelColor(first_pixel + i, pixels.Color(0, bar, 0));
      bar = 0;
    }
  }
}
