#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <TimeLib.h>

#ifndef APPSSID
#define APPSSID "Thinh"  // existing Wifi network
#define APPSK "0903918799"
const char *URL_ADD = "http://192.168.1.4:1234/add";
#endif

const char *ssid = APPSSID;
const char *password = APPSK;
ESP8266WebServer server(80);
MDNSResponder mdns;
WiFiClient client;
HTTPClient http;

#define RST_PIN D3  // Connect to RFID
#define SS_PIN D2

String registedCard[10];
int numRegisted = 0;
MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  Serial.println();
  Serial.print("Connect to existing Wifi network...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  SPI.begin();
  mfrc522.PCD_Init();
  server.enableCORS(true);
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  String cardID;

  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  for (byte i = 0; i < mfrc522.uid.size; i++) {
    cardID += mfrc522.uid.uidByte[i];
  }

  if (!isCardRegistered(cardID)) {
    registedCard[numRegisted] = cardID;
    postJsonData(cardID, "Check-in");
    numRegisted++;
    Serial.println("Thêm thẻ thành công");
  } else {
    Serial.println("Đã check out thẻ");
    postJsonData(cardID, "Check-out");
    removeCard(cardID);
  }
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}

bool isCardRegistered(String cardID) {
  for (int i = 0; i < numRegisted; i++) {
    if (registedCard[i] == cardID) {
      return true;
    }
  }
  return false;
}

void removeCard(String cardID) {
  for (int i = 0; i < numRegisted; i++) {
    if (registedCard[i] == cardID) {
      for (int j = i; j < numRegisted - 1; j++) {
        // Dịch chuyển các thẻ sau lên một vị trí
        registedCard[j] = registedCard[j + 1];
      }
      numRegisted--;
      break;
    }
  }
}

void postJsonData(String data, String action) {
  Serial.print("connecting to ");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[HTTP] begin...\n");
    if (http.begin(client, URL_ADD)) {  // HTTP
      Serial.print("[HTTP] POST...\n");
      time_t now = time(nullptr);
      struct tm *timeinfo;
      timeinfo = localtime(&now);
      char timeStr[20];
      snprintf(timeStr, sizeof(timeStr), "%04d-%02d-%02d %02d:%02d:%02d",
               1900 + timeinfo->tm_year, timeinfo->tm_mon + 1,
               timeinfo->tm_mday,
               timeinfo->tm_hour, timeinfo->tm_min, timeinfo->tm_sec);
      const int capacity = JSON_OBJECT_SIZE(2000);
      StaticJsonDocument<capacity> doc;
      doc["CardID"] = data;
      doc["ThoiGianQuetThe"] = timeStr;
      doc["ThaoTac"] = action;
      char output[2048];
      serializeJson(doc, Serial);  // ghi ra màn hình
      serializeJson(doc, output);  //ghi ra biến output
      http.addHeader("Content-Type", "application/json");
      int httpCode = http.POST(output);
      Serial.println(httpCode);
      Serial.println("HTTP Response Code: " + String(httpCode));
      if (httpCode == HTTP_CODE_OK) {
        // Gửi thành công
        Serial.println("Success");
      } else {
        // Gửi không thành công, xử lý lỗi ở đây
        Serial.println("Failed");
      }
      http.end();  //Close connection
      Serial.println("closing connection");
    }
  }
}
