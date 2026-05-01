import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { adminAPI, rentalAPI } from '../../api';
import { COLORS } from '../../theme';
import { Card, Loading, Button, OutlineButton } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [overdue, setOverdue]     = useState([]);
  const [today, setToday]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 강제반납 모달
  const [forceModal, setForceModal]     = useState(false);
  const [forceTarget, setForceTarget]   = useState(null);
  const [forceReason, setForceReason]   = useState('');
  const [forceLoading, setForceLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, o, t] = await Promise.all([
        adminAPI.stats(),
        adminAPI.overdue(),
        adminAPI.dueToday(),
      ]);
      setStats(s.data);
      setOverdue(o.data);
      setToday(t.data);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  }, []);

  // 화면 진입할 때마다 자동 갱신
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const openForceModal = (rental) => {
    setForceTarget(rental);
    setForceReason('');
    setForceModal(true);
  };

  const handleForceReturn = async () => {
    if (!forceReason.trim()) {
      Alert.alert('알림', '강제 반납 사유를 입력해주세요.');
      return;
    }
    setForceLoading(true);
    try {
      await rentalAPI.forceReturn(forceTarget._id, { reason: forceReason });
      setForceModal(false);
      setForceTarget(null);
      setForceReason('');
      Alert.alert('완료', '강제 반납 처리됐습니다.');
      load();
    } catch (e) {
      Alert.alert('오류', e.response?.data?.message || '처리 실패');
    } finally { setForceLoading(false); }
  };

  if (loading) return <Loading />;

  const statCards = [
    { label: '전체 기자재', value: stats?.total ?? 0,     color: COLORS.text },
    { label: '대여 가능',   value: stats?.available ?? 0,  color: COLORS.mint },
    { label: '대여 중',     value: stats?.rented ?? 0,     color: COLORS.warning },
    { label: '연체',        value: stats?.overdue ?? 0,    color: COLORS.red },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.grayLight }}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>관리자 대시보드</Text>
          <Text style={styles.headerSub}>{user?.name} 관리자</Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [{ text: '취소' }, { text: '확인', onPress: logout }])}
          style={styles.logoutBtn}>
          <Text style={{ color: COLORS.white, fontSize: 13 }}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />}
      >
        {/* 통계 카드 */}
        <View style={styles.statGrid}>
          {statCards.map((c) => (
            <View key={c.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{c.label}</Text>
              <Text style={[styles.statNum, { color: c.color }]}>{c.value}</Text>
            </View>
          ))}
        </View>

        {/* 오늘 반납 예정 */}
        <Text style={styles.sectionTitle}>오늘 반납 예정 ({today.length}건)</Text>
        {today.length === 0
          ? <Text style={styles.emptyText}>없음</Text>
          : today.map((r) => (
            <Card key={r._id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.itemTitle}>{r.equipment?.modelName}</Text>
                  <Text style={styles.itemSub}>{r.user?.name} · {r.user?.studentId}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: COLORS.warningLight }]}>
                  <Text style={[styles.badgeText, { color: COLORS.warning }]}>오늘 마감</Text>
                </View>
              </View>
            </Card>
          ))
        }

        {/* 연체 목록 */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>연체 목록 ({overdue.length}건)</Text>
        {overdue.length === 0
          ? <Text style={styles.emptyText}>연체 없음 ✅</Text>
          : overdue.map((r) => {
            const days = Math.floor((Date.now() - new Date(r.dueDate)) / 86400000);
            return (
              <Card key={r._id} style={{ borderColor: COLORS.red, borderWidth: 0.8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{r.equipment?.modelName}</Text>
                    <Text style={styles.itemSub}>{r.user?.name} · {r.user?.studentId}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.red, marginTop: 4, fontWeight: '600' }}>{days}일 연체</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.badge, { backgroundColor: COLORS.redLight }]}
                    onPress={() => openForceModal(r)}
                  >
                    <Text style={[styles.badgeText, { color: COLORS.red }]}>강제 반납</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        }

        {/* 빠른 메뉴 */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>바로가기</Text>
        <View style={styles.menuGrid}>
          {[
            { label: '기자재 등록', color: COLORS.mint,    bg: COLORS.mintLight,    tab: '기자재' },
            { label: '연장 요청',   color: COLORS.purple,   bg: COLORS.purpleLight,  tab: '대여 현황' },
            { label: '패널티 관리', color: COLORS.warning,  bg: COLORS.warningLight, tab: '패널티' },
            { label: '전체 이력',   color: COLORS.gray,     bg: COLORS.grayLight,    tab: '대여 현황' },
          ].map((m) => (
            <TouchableOpacity key={m.label} style={[styles.menuCard, { backgroundColor: m.bg }]}
              onPress={() => navigation.navigate(m.tab)}>
              <Text style={[styles.menuLabel, { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 강제 반납 모달 */}
      <Modal visible={forceModal} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.forceModalBox}>
            <Text style={styles.forceModalTitle}>강제 반납</Text>
            <Text style={styles.forceModalSub}>{forceTarget?.equipment?.modelName}</Text>
            <Text style={styles.forceModalLabel}>반납 사유 *</Text>
            <TextInput
              style={styles.forceInput}
              placeholder="강제 반납 사유를 입력하세요"
              value={forceReason}
              onChangeText={setForceReason}
              multiline
              numberOfLines={3}
              autoFocus
            />
            <View style={styles.forceBtnRow}>
              <OutlineButton
                title="취소"
                onPress={() => setForceModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={forceLoading ? '처리 중...' : '강제 반납'}
                onPress={handleForceReturn}
                loading={forceLoading}
                style={{ flex: 1, backgroundColor: COLORS.red }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header:          { backgroundColor: COLORS.primaryDark, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:     { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  headerSub:       { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  logoutBtn:       { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  statGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard:        { flex: 1, minWidth: '45%', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: COLORS.border },
  statLabel:       { fontSize: 12, color: COLORS.gray },
  statNum:         { fontSize: 26, fontWeight: '700', marginTop: 4 },
  sectionTitle:    { fontSize: 13, fontWeight: '700', color: COLORS.gray, marginBottom: 8 },
  emptyText:       { fontSize: 13, color: COLORS.gray, textAlign: 'center', paddingVertical: 16 },
  itemTitle:       { fontSize: 14, fontWeight: '600', color: COLORS.text },
  itemSub:         { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  badge:           { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText:       { fontSize: 12, fontWeight: '600' },
  menuGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuCard:        { flex: 1, minWidth: '45%', borderRadius: 12, padding: 16 },
  menuLabel:       { fontSize: 14, fontWeight: '700' },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  forceModalBox:   { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: '100%' },
  forceModalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  forceModalSub:   { fontSize: 13, color: COLORS.gray, marginBottom: 16 },
  forceModalLabel: { fontSize: 13, color: COLORS.gray, marginBottom: 6 },
  forceInput:      { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  forceBtnRow:     { flexDirection: 'row' },
});