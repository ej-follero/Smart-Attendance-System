"use client";

import mqtt, { type MqttClient } from "mqtt";
import { toast } from 'sonner';
import React, { type ReactNode, useContext, useEffect, useState } from "react";

const MQTT = {
  BROKER: process.env.NEXT_PUBLIC_MQTT_WS_BROKER as string,
  PORT: Number(process.env.NEXT_PUBLIC_MQTT_WS_PORT),
  USERNAME: process.env.NEXT_PUBLIC_MQTT_USERNAME,
  PASSWORD: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
  CLIENT_ID: process.env.NEXT_PUBLIC_MQTT_CLIENT_ID,
  MASTER_CARD_ID: process.env.NEXT_PUBLIC_MQTT_MASTER_CARD_ID,
};

interface MQTTMessage {
  topic: string;
  timestamp: string;
  rfid: string;
}
interface MQTTContextState {
  client: MqttClient | null;
  status: "connected" | undefined;
  mode: "attendance" | "registration";
  messages: Array<MQTTMessage>;
  cardId: string | undefined;
}

export const MQTT_TOPIC = {
  STATUS: "/attendance/status",
  MODE: "/attendance/mode",
  ATTENDANCE: "/attendance/run",
  REGISTER: "/attendance/register",
  FEEDBACK: "/attendance/feedback",
} as const;

const MQTT_TOPICS = [
  "/attendance/status",
  "/attendance/mode",
  "/attendance/run",
  "/attendance/register",
];

const MQTTContext = React.createContext<MQTTContextState | null>(null);

// test data
// example fo "Registered" IDs
// const registeredUsers = ["CCB6B542", "6C429C42", "C97E41B8"];

export function MQTTProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [status, setStatus] = useState<"connected" | undefined>(undefined);
  const [mode, setMode] = useState<"attendance" | "registration">("attendance");
  const [messages, setMessages] = useState<MQTTContextState["messages"]>([]);
  const [cardId, setcardId] = useState<string>();
  // Double-tap suppression state (per-RFID cooldown)
  const lastScanAtRef = React.useRef<Record<string, number>>({});
  const SCAN_COOLDOWN_MS = 3000; // 3 seconds

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      console.log('MQTT Provider: Server-side rendering, skipping MQTT connection');
      return;
    }

    // Check if required environment variables are available
    if (!MQTT.BROKER) {
      console.warn('MQTT Provider: Missing MQTT broker URL, skipping connection');
      return;
    }
    
    // Determine if BROKER is a full URL or just hostname
    const brokerIsFullUrl = MQTT.BROKER?.startsWith('ws://') || MQTT.BROKER?.startsWith('wss://');
    
    // If BROKER is provided but PORT is missing and BROKER doesn't include port, skip
    if (!brokerIsFullUrl && !MQTT.PORT) {
      console.warn('MQTT Provider: Missing MQTT port, skipping connection');
      return;
    }
    
    // Build connection options
    const connectOptions: any = {
      username: MQTT.USERNAME || undefined,
      password: MQTT.PASSWORD || undefined,
      clientId: MQTT.CLIENT_ID || `icct-attendance-${Date.now()}`,
      connectTimeout: 30000, // 30 seconds timeout (increased from 10s)
      reconnectPeriod: 5000, // 5 seconds reconnect interval
      keepalive: 60, // Keepalive interval in seconds
      clean: true, // Clean session
      // Disable automatic reconnection on DNS errors to prevent spam
      will: undefined,
    };
    
    // Only add port if BROKER is not a full URL
    if (!brokerIsFullUrl && MQTT.PORT) {
      connectOptions.port = MQTT.PORT;
    }

    console.log('MQTT Config:', {
      BROKER: MQTT.BROKER,
      PORT: brokerIsFullUrl ? 'included in URL' : MQTT.PORT,
      USERNAME: MQTT.USERNAME ? '***' : 'none',
      CLIENT_ID: connectOptions.clientId,
      brokerIsFullUrl
    });
    
    // Warn if broker URL looks suspicious (common DNS issues)
    if (brokerIsFullUrl && MQTT.BROKER.includes('emqxsl.com')) {
      console.warn('WARNING: Using EMQX Cloud broker. If connection fails, verify:');
      console.warn('  1. The EMQX Cloud instance is active');
      console.warn('  2. The broker URL is correct in your .env file');
      console.warn('  3. Network connectivity is available');
    }

    try {
      console.log('Attempting MQTT connection...');
      const _client = mqtt.connect(MQTT.BROKER, connectOptions);

      if (!_client) {
        console.error('Failed to create MQTT client');
        return;
      }

      // Track connection attempt start time
      const connectionStartTime = Date.now();

      _client.on("connect", () => {
        const connectionTime = Date.now() - connectionStartTime;
        console.log(`MQTT Connected successfully (took ${connectionTime}ms)`);
        // Clear timeout error flag on successful connection
        (window as any).__mqtt_timeout_logged = false;
        setClient(_client);
        setStatus("connected");

        // Check if client is still connected before subscribing
        if (_client && _client.connected) {
          try {
            _client.subscribe(MQTT_TOPICS);
            console.log('MQTT Subscribed to topics:', MQTT_TOPICS);
          } catch (subscribeError) {
            console.error('MQTT Subscription error:', subscribeError);
          }
        }
      });

      _client.on("error", (error: any) => {
        const errorMessage = error?.message || String(error);
        
        // Handle connack timeout specifically (log once, use warnings to avoid noisy errors)
        if (errorMessage.includes('connack timeout') || 
            errorMessage.includes('Connection timeout') ||
            errorMessage.includes('timeout')) {
          if (!(window as any).__mqtt_timeout_logged) {
            console.warn('[WARN] MQTT Connection Timeout (connack timeout)');
            console.warn('The broker did not respond within the timeout period.');
            console.warn(`Broker URL: ${MQTT.BROKER}`);
            console.warn('Possible causes:');
            console.warn('  1. Broker is not running or unreachable');
            console.warn('  2. Incorrect broker URL or port');
            console.warn('  3. Network connectivity issues');
            console.warn('  4. Firewall blocking the connection');
            console.warn('  5. Broker requires authentication but credentials are missing/incorrect');
            toast.warning("MQTT: Connection timeout. Check broker URL/port or network.");
            (window as any).__mqtt_timeout_logged = true;
          }
        }
        // Only log errors, don't spam console for DNS failures
        else if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
            errorMessage.includes('getaddrinfo ENOTFOUND') ||
            errorMessage.includes('ENOTFOUND')) {
          // Log once with helpful message
          if (!(window as any).__mqtt_dns_error_logged) {
            console.warn('[WARN] MQTT Broker DNS Resolution Failed');
            console.warn('The broker domain cannot be resolved. MQTT features will be unavailable.');
            console.warn(`Broker URL: ${MQTT.BROKER}`);
            console.warn('To fix: Update NEXT_PUBLIC_MQTT_WS_BROKER in your .env file with a valid broker URL');
            (window as any).__mqtt_dns_error_logged = true;
          }
        } else {
          console.error('MQTT Connection error:', error);
        }
        
        setStatus(undefined);
      });

      _client.on("offline", () => {
        console.warn('MQTT Client went offline');
        setStatus(undefined);
      });

      _client.on("close", () => {
        console.log('MQTT Connection closed');
        setStatus(undefined);
      });

      _client.on("disconnect", () => {
        console.log('MQTT Disconnected');
        setStatus(undefined);
      });

      return () => {
        if (_client) {
          try {
            if (_client.connected) {
              _client.unsubscribe(MQTT_TOPICS);
            }
            _client.end();
            console.log('MQTT Client cleaned up');
          } catch (cleanupError) {
            console.error('MQTT Cleanup error:', cleanupError);
          }
        }
      };
    } catch (error) {
      console.error('MQTT Provider initialization error:', error);
    }
  }, []);

  useEffect(() => {
    if (!client || !client.connected) return;

    const handleMessage = (topic: string, payload: Buffer) => {
      try {
        const data = JSON.parse(payload.toString());

        if (!data) return;

        if (topic === MQTT_TOPIC.STATUS && data?.status === "connected") {
          setStatus("connected");
          return;
        }

        if (topic === MQTT_TOPIC.MODE) {
          if (data.mode === "registration") {
            setMode("registration");
          } else if (data.mode === "attendance") {
            setMode("attendance");
          }
        }

        if (data.rfid === MQTT.MASTER_CARD_ID) return;

        if (data.mode === "attendance" && topic === MQTT_TOPIC.ATTENDANCE) {
          console.log('[MQTT] Attendance scan received:', data);
          console.log('[MQTT] RFID Tag:', data.rfid, 'Reader:', data.readerId, 'Location:', data.location);
          // Client-side dedupe: suppress rapid double taps
          try {
            const now = Date.now();
            const last = lastScanAtRef.current[data.rfid];
            if (last && now - last < SCAN_COOLDOWN_MS) {
              console.log('[MQTT] Duplicate tap suppressed within cooldown window');
              if (client.connected) {
                client.publish(
                  MQTT_TOPIC.FEEDBACK,
                  JSON.stringify({
                    topic: MQTT_TOPIC.FEEDBACK,
                    message: 'Already scanned',
                    status: 'recognized',
                    value: data.rfid,
                  }),
                );
              }
              return;
            }
            lastScanAtRef.current[data.rfid] = now;
          } catch {}
          
          // Send directly to attendance API - it now handles both Student.rfidTag and RFIDTags.tagNumber
          fetch('/api/attendance/mqtt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              rfid: data.rfid,
              readerId: data.readerId || 1,
              location: data.location || 'Unknown',
              deviceInfo: {
                timestamp: data.timestamp || new Date().toISOString(),
                mqttSource: true
              }
            })
          }).then(response => response.json())
            .then(result => {
              if (result.success) {
                console.log('[MQTT] Attendance record created:', result.attendance);
                // success feedback
                if (client.connected) {
                  client.publish(
                    MQTT_TOPIC.FEEDBACK,
                    JSON.stringify({
                      topic: MQTT_TOPIC.FEEDBACK,

                      message: result.duplicate ? 'Already scanned' : 'Recorded!',
                      status: "recognized",
                      value: data.rfid,
                    }),
                  );
                }
                
                toast.success(result.duplicate ? 'Already scanned' : 'Attendance recorded');
              } else {
                const errMsg = typeof result.error === 'string' ? result.error : 'Failed to record attendance';
                const isUnrecognized = /not\s*found/i.test(errMsg);
                if (isUnrecognized) {
                  console.warn('[MQTT] Unrecognized card:', errMsg);
                  const display = `Unrecognized card${data?.rfid ? ` (RFID: ${data.rfid})` : ''}`;
                  // softer UX for unrecognized cards
                  toast.info(display);
                } else {
                  console.error('[MQTT] Attendance record failed:', errMsg);
                  toast.error(`${errMsg}${data?.rfid ? ` (RFID: ${data.rfid})` : ''}`);
                }
                // error feedback
                if (client.connected) {
                  client.publish(
                    MQTT_TOPIC.FEEDBACK,
                    JSON.stringify({
                      topic: MQTT_TOPIC.FEEDBACK,
                      message: /not\s*found/i.test(errMsg) ? 'Unrecognized card' : 'Error',
                      status: "unrecognized",
                      value: data.rfid,
                    }),
                  );
                }
              }
            })
            .catch(error => {
              console.error('[MQTT] Attendance API error:', error);
              toast.error('Attendance service error');
              if (client.connected) {
                client.publish(
                  MQTT_TOPIC.FEEDBACK,
                  JSON.stringify({
                    topic: MQTT_TOPIC.FEEDBACK,
                    message: 'Service error',
                    status: "error",
                    value: data.rfid,
                  }),
                );
              }
            });
          
          setMessages((current) => [...current, { topic, ...data }]);
        } else if (
          data.mode === "registration" &&
          topic === MQTT_TOPIC.REGISTER
        ) {
          setcardId(data.rfid);
          setMessages((current) => [...current, { topic, ...data }]);
        
          // Check if card exists in your DB (optional: via fetch)
          // For now we'll just send recognized status by default
          if (client.connected) {
            client.publish(
              MQTT_TOPIC.FEEDBACK,
              JSON.stringify({
                topic: MQTT_TOPIC.FEEDBACK,
                message: "Card ready for registration",
                status: "recognized",
                value: data.rfid,
              }),
            );
          }
        } else if (data.mode === "reader_registration" && topic === MQTT_TOPIC.REGISTER) {
          // Handle new RFID reader registration
          console.log('[MQTT] New RFID reader detected:', data);
          
          // Send reader registration to backend
          fetch('/api/rfid/readers/mqtt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              deviceId: data.deviceId || data.rfid,
              deviceName: data.deviceName || `Reader ${data.deviceId || data.rfid}`,
              ipAddress: data.ipAddress,
              macAddress: data.macAddress,
              firmwareVersion: data.firmwareVersion,
              location: data.location
            })
          }).then(response => response.json())
            .then(result => {
              if (result.success) {
                console.log('[MQTT] Reader registered successfully:', result.data);
              } else {
                console.error('[MQTT] Reader registration failed:', result.error);
              }
            })
            .catch(error => {
              console.error('[MQTT] Reader registration error:', error);
            });
          
          setMessages((current) => [...current, { topic, ...data }]);
        }
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log("Invalid JSON payload");
        } else {
          console.log(error);
        }
      }
    };

    client.on("message", handleMessage);

    return () => {
      if (client) {
        client.removeListener("message", handleMessage);
      }
    };
  }, [client]);

  return (
    <MQTTContext.Provider value={{ client, messages, status, mode, cardId }}>
      {children}
    </MQTTContext.Provider>
  );
}

export function useMQTTClient() {
  const context = useContext(MQTTContext);

  if (!context)
    throw new Error(`useMQTTClient must be used inside a <MQTTProvider />.`);

  return context;
}