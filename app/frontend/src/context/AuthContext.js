import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';
import { registerForPushNotifications } from '../../notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data);
        } catch {
          await AsyncStorage.removeItem('token');
        }
      }
      setLoading(false);
    })();
  }, []);

  const registerFCM = async () => {
    try {
      const fcmToken = await registerForPushNotifications();
      if (fcmToken) {
        await authAPI.updateFCMToken(fcmToken);
        console.log('[FCM] 토큰 서버 저장 완료:', fcmToken);
      }
    } catch (e) {
      console.log('[FCM] 토큰 등록 실패:', e.message);
    }
  };

  const login = async (studentId, password) => {
    const res = await authAPI.login({ studentId, password });
    await AsyncStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    await registerFCM();
    return res.data.user;
  };

  const adminLogin = async (adminId, password) => {
    const res = await authAPI.adminLogin({ adminId, password });
    await AsyncStorage.setItem('token', res.data.token);
    const admin = { ...res.data.admin, role: 'admin' };
    setUser(admin);
    return admin;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);