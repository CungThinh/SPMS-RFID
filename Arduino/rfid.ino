#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#ifndef APSSID
#define APSSID "Thinh"  // existing Wifi network
#define APPSK "*********"
const char *URL = "***************";
#endif

const char *ssid = APSSID;
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
  postJsonData();
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
    numRegisted++;
    Serial.println("Thêm thẻ thành công");
  } else {
    Serial.println("Đã check out thẻ");
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
      // Dịch chuyển các thẻ sau lên một vị trí
      for (int j = i; j < numRegisted - 1; j++) {
        registedCard[j] = registedCard[j + 1];
      }
      numRegisted--;
      break;
    }
  }
}

void postJsonData(string data) {
  Serial.print("connecting to ");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[HTTP] begin...\n");
    if (http.begin(client, URL)) {  // HTTP
      Serial.print("[HTTP] POST...\n");
      //gui du lieu len server dang JSON
      const int capacity = JSON_OBJECT_SIZE(2000);
      StaticJsonDocument<capacity> doc;
      doc["uid"] = "data";
      char output[2048];
      serializeJson(doc, Serial);  // ghi ra man hinh
      serializeJson(doc, output);  //ghi ra bien output
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
      http.end();  //Close connection Serial.println();
      Serial.println("closing connection");
    }
  }
}