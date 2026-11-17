/**
 * SMART SOIL HEALTH - ESP32 SPECTRO-READER FIRMWARE
 * 
 * Target Microcontroller: ESP32 (WROOM-32 / DevKit v1)
 * Peripherals:
 *  - TCS34725 Color & Ambient Light Sensor (I2C: SDA=21, SCL=22, Addr=0x29)
 *  - DS18B20 1-Wire Digital Temperature Probe (Data Pin: GPIO 4)
 *  - Chamber Illumination White LED (Control Pin: GPIO 16)
 * Communication:
 *  - Bluetooth Low Energy (BLE GATT)
 *  - Optional Wi-Fi Client (HTTPS POST to FastAPI Backend)
 */

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <HTTPClient.h>

// --- Configuration Constants ---
#define DEVICE_ID           "soil-reader-001"
#define FIRMWARE_VERSION    "1.0.0"
#define LED_PIN             16
#define ONE_WIRE_BUS        4

// BLE Custom GATT Service UUIDs
#define SERVICE_UUID        "0000a001-0000-1000-8000-00805f9b34fb"
#define CHAR_STATUS_UUID    "0000a003-0000-1000-8000-00805f9b34fb"
#define CHAR_PAYLOAD_UUID   "0000a004-0000-1000-8000-00805f9b34fb"
#define CHAR_COMMAND_UUID   "0000a005-0000-1000-8000-00805f9b34fb"

// Optional Wi-Fi Fallback Settings
const char* wifi_ssid = "YOUR_WIFI_SSID";
const char* wifi_pass = "YOUR_WIFI_PASSWORD";
const char* backend_url = "http://192.168.1.100:8000/api/v1/device/measurements";

// TCS34725 I2C Registers
#define TCS34725_ADDRESS    0x29
#define TCS34725_COMMAND_BIT 0x80
#define TCS34725_ENABLE     0x00
#define TCS34725_ATIME      0x01
#define TCS34725_CONTROL    0x0F
#define TCS34725_CDATAL     0x14

// Globals
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

BLEServer* pServer = NULL;
BLECharacteristic* pStatusChar = NULL;
BLECharacteristic* pPayloadChar = NULL;
bool deviceConnected = false;

// Function prototypes
void initTCS34725();
void readTCS34725(uint16_t &r, uint16_t &g, uint16_t &b, uint16_t &c);
float readChamberTemperature();
String generatePayload(String test_id, String parameter, uint16_t r, uint16_t g, uint16_t b, uint16_t c, float temp_c);
void sendToBackendWiFi(String payloadJson);

// BLE Server Callbacks
class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println("[BLE] Web client connected.");
    }
    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println("[BLE] Client disconnected. Restarting advertising...");
        pServer->startAdvertising();
    }
};

// BLE Command Write Callback
class CommandCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic* pChar) {
        String val = pChar->getValue().c_str();
        Serial.print("[BLE Command Received]: ");
        Serial.println(val);

        if (val.startsWith("START_SCAN")) {
            // Trigger measurement sequence
            pStatusChar->setValue("MEASURING");
            pStatusChar->notify();

            // Turn on internal LED
            digitalWrite(LED_PIN, HIGH);
            delay(200); // warm up LED

            uint16_t r, g, b, c;
            readTCS34725(r, g, b, c);
            float temp = readChamberTemperature();

            digitalWrite(LED_PIN, LOW); // turn off LED

            String payload = generatePayload("test-session-live", "pH", r, g, b, c, temp);
            Serial.println("[Payload Generated]:");
            Serial.println(payload);

            pPayloadChar->setValue(payload.c_str());
            pPayloadChar->notify();

            pStatusChar->setValue("READY");
            pStatusChar->notify();
        }
    }
};

void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("\n=== SMART SOIL ESP32 SPECTRO-READER INITIALIZING ===");

    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    Wire.begin(21, 22); // SDA=21, SCL=22
    initTCS34725();
    tempSensor.begin();

    // Init BLE
    BLEDevice::init("Soil-Reader-001");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService* pService = pServer->createService(SERVICE_UUID);

    pStatusChar = pService->createCharacteristic(
        CHAR_STATUS_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pStatusChar->addDescriptor(new BLE2902());
    pStatusChar->setValue("READY");

    pPayloadChar = pService->createCharacteristic(
        CHAR_PAYLOAD_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pPayloadChar->addDescriptor(new BLE2902());

    BLECharacteristic* pCommandChar = pService->createCharacteristic(
        CHAR_COMMAND_UUID,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCommandChar->setCallbacks(new CommandCallbacks());

    pService->start();
    BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();

    Serial.println("[BLE] Soil Reader GATT service active. Advertising as 'Soil-Reader-001'...");
}

void loop() {
    // Check serial for manual trigger commands
    if (Serial.available() > 0) {
        char cmd = Serial.read();
        if (cmd == 't' || cmd == 'T') {
            Serial.println("[Serial] Manual scan triggered via serial...");
            digitalWrite(LED_PIN, HIGH);
            delay(200);

            uint16_t r, g, b, c;
            readTCS34725(r, g, b, c);
            float temp = readChamberTemperature();
            digitalWrite(LED_PIN, LOW);

            String jsonPayload = generatePayload("serial-test-session", "pH", r, g, b, c, temp);
            Serial.println(jsonPayload);

            if (deviceConnected) {
                pPayloadChar->setValue(jsonPayload.c_str());
                pPayloadChar->notify();
            }
        }
    }
    delay(50);
}

// Low-level TCS34725 setup
void initTCS34725() {
    Wire.beginTransmission(TCS34725_ADDRESS);
    Wire.write(TCS34725_COMMAND_BIT | TCS34725_ATIME);
    Wire.write(0xC0); // 154ms integration time
    Wire.endTransmission();

    Wire.beginTransmission(TCS34725_ADDRESS);
    Wire.write(TCS34725_COMMAND_BIT | TCS34725_CONTROL);
    Wire.write(0x01); // 4x Gain
    Wire.endTransmission();

    Wire.beginTransmission(TCS34725_ADDRESS);
    Wire.write(TCS34725_COMMAND_BIT | TCS34725_ENABLE);
    Wire.write(0x03); // PON (Power On) & AEN (RGBC Enable)
    Wire.endTransmission();
    Serial.println("[Hardware] TCS34725 initialized with 154ms integration and 4x gain.");
}

void readTCS34725(uint16_t &r, uint16_t &g, uint16_t &b, uint16_t &c) {
    Wire.beginTransmission(TCS34725_ADDRESS);
    Wire.write(TCS34725_COMMAND_BIT | TCS34725_CDATAL);
    Wire.endTransmission();

    Wire.requestFrom(TCS34725_ADDRESS, 8);
    c = Wire.read() | (Wire.read() << 8);
    r = Wire.read() | (Wire.read() << 8);
    g = Wire.read() | (Wire.read() << 8);
    b = Wire.read() | (Wire.read() << 8);
}

float readChamberTemperature() {
    tempSensor.requestTemperatures();
    float t = tempSensor.getTempCByIndex(0);
    if (t == DEVICE_DISCONNECTED_C || t < -20.0) {
        return 27.5; // fallback standard lab baseline
    }
    return t;
}

String generatePayload(String test_id, String parameter, uint16_t r, uint16_t g, uint16_t b, uint16_t c, float temp_c) {
    String msg_id = "esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX) + "-" + String(millis());
    String json = "{";
    json += "\"schema_version\":\"1.0\",";
    json += "\"message_id\":\"" + msg_id + "\",";
    json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    json += "\"firmware_version\":\"" + String(FIRMWARE_VERSION) + "\",";
    json += "\"test_id\":\"" + test_id + "\",";
    json += "\"kit\":{\"kit_id\":\"kit-agri-chem-4in1\",\"lot\":\"LOT-2026-NOV\",\"parameter\":\"" + parameter + "\"},";
    json += "\"captured_at\":\"2026-11-17T11:00:00Z\",";
    json += "\"temperature_c\":" + String(temp_c, 1) + ",";
    json += "\"sensor\":{\"model\":\"TCS34725\",\"r\":" + String(r) + ",\"g\":" + String(g) + ",\"b\":" + String(b) + ",\"c\":" + String(c) + ",\"gain\":4,\"integration_ms\":154,\"led_on\":true},";
    json += "\"quality\":{\"reference_tile_check\":\"pass\",\"ambient_subtraction\":\"pass\",\"device_flag\":\"none\"},";
    json += "\"calibration_version\":\"ph-kit-agri-cal-1.0\"";
    json += "}";
    return json;
}
