/*
  Air Quality Sensor for ESP32/ESP8266
  Posts PM2.5, NO2, Temp, Humidity to your Web API

  Libraries needed:
    - WiFi.h (ESP32) or ESP8266WiFi.h (ESP8266)
    - HTTPClient.h

  Example is for ESP32. Modify for ESP8266 as needed.
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---- CONFIG ----
const char* WIFI_SSID = "your_wifi_ssid";
const char* WIFI_PASSWORD = "your_wifi_password";
const char* API_HOST = "http://192.168.1.100:4000"; // Your backend API host
const char* API_ENDPOINT = "/api/sensors";
const int POST_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Simulated sensor values (replace with your sensor read code)
float readPM25() { return 25 + random(-5, 10); }
float readNO2() { return 10 + random(-2, 5); }
float readTemperature() { return 26 + random(-2, 2); }
float readHumidity() { return 55 + random(-5, 10); }

void setup() {
  Serial.begin(115200);
  delay(1000);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println(" Connected!");
}

void loop() {
  if ((WiFi.status() == WL_CONNECTED)) {
    HTTPClient http;
    String url = String(API_HOST) + API_ENDPOINT;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["pm25"] = readPM25();
    doc["no2"] = readNO2();
    doc["temperature"] = readTemperature();
    doc["humidity"] = readHumidity();
    doc["timestamp"] = getISOTime();

    String payload;
    serializeJson(doc, payload);

    int httpCode = http.POST(payload);
    Serial.printf("POST %s [%d] %s\n", url.c_str(), httpCode, payload.c_str());
    http.end();
  }
  delay(POST_INTERVAL_MS);
}

// Helper to get ISO timestamp (yyyy-MM-ddTHH:mm:ssZ)
String getISOTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "";
  }
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buf);
}