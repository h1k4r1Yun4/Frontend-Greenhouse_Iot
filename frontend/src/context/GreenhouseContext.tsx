import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  ZoneData,
  GatewayData,
  ActuatorState,
  ActuatorType,
  AutomationRule,
  AlertItem,
  UserRole,
  ConnectionStatus,
} from '../types';
import {
  RuntimeConfig,
  loadRuntimeConfig,
  saveRuntimeConfig,
} from '../config/runtimeConfig';
import {
  mockSimulator,
  getApiClient,
  createTelemetryStream,
  HealthCheckResult,
} from '../services/api';

export interface GreenhouseContextType {
  zones: ZoneData[];
  gateway: GatewayData;
  actuators: ActuatorState[];
  rules: AutomationRule[];
  alerts: AlertItem[];
  connectionStatus: ConnectionStatus;
  userRole: UserRole;
  selectedZoneId: 'zone1' | 'zone2' | 'all';
  unreadAlertsCount: number;
  lastSyncTime: string;
  isEmergencyHalted: boolean;
  telemetryInterval: number;
  runtimeConfig: RuntimeConfig;
  backendError: string | null;

  // Actions
  toggleActuator: (id: ActuatorType, action: 'ON' | 'OFF', powerLevel?: number) => Promise<void>;
  setActuatorPower: (id: ActuatorType, powerLevel: number) => Promise<void>;
  emergencyStop: () => Promise<void> | void;
  rearmSystem: () => Promise<void>;
  setTelemetryInterval: (seconds: number) => Promise<void>;
  updateRule: (rule: AutomationRule) => Promise<void>;
  addRule: (rule: Omit<AutomationRule, 'id'>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  toggleRule: (id: string) => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  setUserRole: (role: UserRole) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSelectedZoneId: (zoneId: 'zone1' | 'zone2' | 'all') => void;
  updateRuntimeConfig: (partial: Partial<RuntimeConfig>) => void;
  testBackendConnection: (overrideConfig?: Partial<RuntimeConfig>) => Promise<HealthCheckResult>;
  clearBackendError: () => void;
}

const GreenhouseContext = createContext<GreenhouseContextType | undefined>(undefined);

export const GreenhouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfig>(() => loadRuntimeConfig());
  const [zones, setZones] = useState<ZoneData[]>(mockSimulator.zones);
  const [gateway, setGateway] = useState<GatewayData>(mockSimulator.gateway);
  const [actuators, setActuators] = useState<ActuatorState[]>(mockSimulator.actuators);
  const [rules, setRules] = useState<AutomationRule[]>(mockSimulator.rules);
  const [alerts, setAlerts] = useState<AlertItem[]>(mockSimulator.alerts);
  const [connectionStatus, setConnectionStatusState] = useState<ConnectionStatus>('online');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [selectedZoneId, setSelectedZoneId] = useState<'zone1' | 'zone2' | 'all'>('all');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());
  const [isEmergencyHalted, setIsEmergencyHalted] = useState<boolean>(false);
  const [telemetryInterval, setTelemetryIntervalState] = useState<number>(() =>
    mockSimulator.getIntervalSeconds()
  );
  const [backendError, setBackendError] = useState<string | null>(null);

  const apiClient = useMemo(() => getApiClient(runtimeConfig), [runtimeConfig]);

  // Subscribe to active telemetry stream (MockSimulator or WebSocket)
  useEffect(() => {
    setBackendError(null);

    if (runtimeConfig.apiMode === 'mock') {
      // Fresh provider mount resets singleton interlock & offline state for deterministic sessions/tests
      mockSimulator.setEmergencyHalted(false);
      mockSimulator.setOffline(false);
      setIsEmergencyHalted(false);
      setConnectionStatusState('online');
      setTelemetryIntervalState(mockSimulator.getIntervalSeconds());
    }

    const stream = createTelemetryStream(runtimeConfig, (connected) => {
      setConnectionStatusState(connected ? 'online' : 'offline');
    });

    stream.start();

    const unsubscribe = stream.subscribe((event) => {
      setZones(event.zones);
      setGateway(event.gateway);
      setActuators(event.actuators);
      setAlerts(event.alerts);
      if (typeof event.isEmergencyHalted === 'boolean') {
        setIsEmergencyHalted(event.isEmergencyHalted);
      }
      if (typeof event.telemetryIntervalSeconds === 'number') {
        setTelemetryIntervalState(event.telemetryIntervalSeconds);
      }
      setLastSyncTime(new Date().toISOString());
    });

    let active = true;
    if (runtimeConfig.apiMode === 'http') {
      Promise.all([
        apiClient.getZones(),
        apiClient.getGateway(),
        apiClient.getActuators(),
        apiClient.getRules(),
        apiClient.getAlerts(),
      ])
        .then(([z, g, a, r, al]) => {
          if (!active) return;
          setZones(z);
          setGateway(g);
          setActuators(a);
          setRules(r);
          setAlerts(al);
          setConnectionStatusState('online');
          setLastSyncTime(new Date().toISOString());
        })
        .catch((err) => {
          if (!active) return;
          setConnectionStatusState('offline');
          setBackendError(
            (err as Error)?.message || 'Không thể tải dữ liệu khởi tạo từ Backend API.'
          );
        });
    }

    return () => {
      active = false;
      unsubscribe();
      stream.stop();
    };
  }, [runtimeConfig, apiClient]);

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged && !a.resolved).length;

  const setConnectionStatus = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatusState(status);
      if (runtimeConfig.apiMode === 'mock') {
        mockSimulator.setOffline(status === 'offline');
      }
    },
    [runtimeConfig.apiMode]
  );

  const toggleActuator = useCallback(
    async (id: ActuatorType, action: 'ON' | 'OFF', powerLevel?: number) => {
      if (userRole === 'viewer') return;
      if (isEmergencyHalted && action === 'ON') return;

      try {
        const updated = await apiClient.toggleActuator(id, action, powerLevel);
        setActuators((prev) => prev.map((a) => (a.id === id ? updated : a)));
        setBackendError(null);
      } catch (err) {
        setBackendError((err as Error)?.message || 'Không thể gửi lệnh điều khiển thiết bị.');
      }
    },
    [apiClient, userRole, isEmergencyHalted]
  );

  const setActuatorPower = useCallback(
    async (id: ActuatorType, powerLevel: number) => {
      if (userRole === 'viewer' || isEmergencyHalted) return;

      try {
        const updated = await apiClient.setActuatorPower(id, powerLevel);
        setActuators((prev) => prev.map((a) => (a.id === id ? updated : a)));
        setBackendError(null);
      } catch (err) {
        setBackendError((err as Error)?.message || 'Không thể cập nhật công suất PWM.');
      }
    },
    [apiClient, userRole, isEmergencyHalted]
  );

  const emergencyStop = useCallback(() => {
    if (userRole === 'viewer') return;

    setIsEmergencyHalted(true);
    if (runtimeConfig.apiMode === 'mock') {
      mockSimulator.emergencyStop();
      setActuators([...mockSimulator.actuators]);
      setAlerts([...mockSimulator.alerts]);
      setBackendError(null);
      return Promise.resolve();
    }

    return apiClient
      .emergencyStop()
      .then(async () => {
        const [a, al] = await Promise.all([apiClient.getActuators(), apiClient.getAlerts()]);
        setActuators(a);
        setAlerts(al);
        setBackendError(null);
      })
      .catch((err) => {
        setBackendError((err as Error)?.message || 'Lỗi khi gửi lệnh dừng khẩn cấp.');
      });
  }, [apiClient, runtimeConfig.apiMode, userRole]);

  const rearmSystem = useCallback(() => {
    if (userRole === 'viewer') return Promise.resolve();

    if (runtimeConfig.apiMode === 'mock') {
      mockSimulator.rearmSystem();
      setIsEmergencyHalted(false);
      setAlerts([...mockSimulator.alerts]);
      setBackendError(null);
      return Promise.resolve();
    }

    return apiClient
      .rearmSystem()
      .then(async () => {
        setIsEmergencyHalted(false);
        const al = await apiClient.getAlerts();
        setAlerts(al);
        setBackendError(null);
      })
      .catch((err) => {
        setBackendError((err as Error)?.message || 'Lỗi khi khôi phục hệ thống (Re-arm).');
      });
  }, [apiClient, runtimeConfig.apiMode, userRole]);

  const setTelemetryInterval = useCallback(
    async (seconds: number) => {
      if (userRole === 'viewer') return;
      const clamped = Math.max(1, Math.min(60, Math.round(seconds)));
      try {
        const res = await apiClient.setTelemetryInterval(clamped);
        setTelemetryIntervalState(res.intervalSeconds);
        setBackendError(null);
      } catch (err) {
        setBackendError((err as Error)?.message || 'Không thể cập nhật chu kỳ tiết kiệm pin.');
      }
    },
    [apiClient, userRole]
  );

  const updateRule = useCallback(
    async (rule: AutomationRule) => {
      if (userRole === 'viewer') return;
      const saved = await apiClient.updateRule(rule);
      setRules((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
    },
    [apiClient, userRole]
  );

  const addRule = useCallback(
    async (ruleData: Omit<AutomationRule, 'id'>) => {
      if (userRole === 'viewer') return;
      const saved = await apiClient.addRule(ruleData);
      setRules((prev) => [...prev, saved]);
    },
    [apiClient, userRole]
  );

  const deleteRule = useCallback(
    async (id: string) => {
      if (userRole === 'viewer') return;
      const success = await apiClient.deleteRule(id);
      if (success) {
        setRules((prev) => prev.filter((r) => r.id !== id));
      }
    },
    [apiClient, userRole]
  );

  const toggleRule = useCallback(
    async (id: string) => {
      if (userRole === 'viewer') return;
      const updated = await apiClient.toggleRule(id);
      setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    },
    [apiClient, userRole]
  );

  const acknowledgeAlert = useCallback(
    async (id: string) => {
      if (userRole === 'viewer') return;
      const updated = await apiClient.acknowledgeAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    },
    [apiClient, userRole]
  );

  const resolveAlert = useCallback(
    async (id: string) => {
      if (userRole === 'viewer') return;
      const updated = await apiClient.resolveAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    },
    [apiClient, userRole]
  );

  const updateRuntimeConfig = useCallback((partial: Partial<RuntimeConfig>) => {
    const next = saveRuntimeConfig(partial);
    setRuntimeConfig(next);
  }, []);

  const testBackendConnection = useCallback(
    async (overrideConfig?: Partial<RuntimeConfig>): Promise<HealthCheckResult> => {
      const targetConfig = overrideConfig
        ? { ...runtimeConfig, ...overrideConfig }
        : runtimeConfig;
      const client = getApiClient(targetConfig);
      return client.healthCheck();
    },
    [runtimeConfig]
  );

  const clearBackendError = useCallback(() => {
    setBackendError(null);
  }, []);

  return (
    <GreenhouseContext.Provider
      value={{
        zones,
        gateway,
        actuators,
        rules,
        alerts,
        connectionStatus,
        userRole,
        selectedZoneId,
        unreadAlertsCount,
        lastSyncTime,
        isEmergencyHalted,
        telemetryInterval,
        runtimeConfig,
        backendError,
        toggleActuator,
        setActuatorPower,
        emergencyStop,
        rearmSystem,
        setTelemetryInterval,
        updateRule,
        addRule,
        deleteRule,
        toggleRule,
        acknowledgeAlert,
        resolveAlert,
        setUserRole,
        setConnectionStatus,
        setSelectedZoneId,
        updateRuntimeConfig,
        testBackendConnection,
        clearBackendError,
      }}
    >
      {children}
    </GreenhouseContext.Provider>
  );
};

export const useGreenhouse = (): GreenhouseContextType => {
  const context = useContext(GreenhouseContext);
  if (!context) {
    throw new Error('useGreenhouse must be used within a GreenhouseProvider');
  }
  return context;
};
