import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { equipmentAPI, waitlistAPI } from '../api';
import { COLORS, STATUS } from '../theme';
import { Badge, Button, OutlineButton, Card, Loading, Divider } from '../components/UI';

const CAT_EMOJI = {
  '노트북':        '💻',
  '카메라':        '📷',
  '태블릿':        '📱',
  '음향 장비':     '🎙',
  '주변기기':      '🖱️',
  '촬영 장비':     '🎬',
  '네트워크 장비': '🌐',
  '사무용품':      '🖨️',
};

export default function EquipmentDetail() {
  const { params: { id } } = useRoute();
  const navigation = useNavigation();
  const [item, setItem]           = useState(null);
  const [waitInfo, setWaitInfo]   = useState({ count: 0, isWaiting: false, waitlistId: null });
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    equipmentAPI.getOne(id)
      .then((r) => setItem(r.data))
      .catch(() => Alert.alert('오류', '기자재 정보를 불러올 수 없습니다.'));

    waitlistAPI.getByEquipment(id)
      .then((r) => setWaitInfo(r.data))
      .catch(() => {});
  }, [id]);

  if (!item) return <Loading />;

  const st    = STATUS[item.status] || STATUS.AVAILABLE;
  const emoji = CAT_EMOJI[item.category?.name] || '📦';

  const handleRentPress = () => {
    navigation.navigate('QR 스캔', { rentItemId: item._id });
  };

  const handleWaitlist = async () => {
    if (waitInfo.isWaiting) {
      Alert.alert(
        '예약 대기 취소',
        '예약 대기를 취소하시겠습니까?',
        [
          { text: '아니오', style: 'cancel' },
          {
            text: '취소하기',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await waitlistAPI.cancel(waitInfo.waitlistId);
                setWaitInfo({ count: waitInfo.count - 1, isWaiting: false, waitlistId: null });
                Alert.alert('완료', '예약 대기가 취소됐습니다.');
              } catch (e) {
                Alert.alert('오류', e.response?.data?.message || '취소 실패');
              } finally { setLoading(false); }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '예약 대기',
        `현재 ${waitInfo.count}명이 대기 중입니다.\n예약 대기를 신청하시겠습니까?`,
        [
          { text: '아니오', style: 'cancel' },
          {
            text: '신청하기',
            onPress: async () => {
              try {
                setLoading(true);
                const res = await waitlistAPI.join(id);
                setWaitInfo({ count: waitInfo.count + 1, isWaiting: true, waitlistId: res.data.waitlistId });
                Alert.alert('완료', res.data.message);
              } catch (e) {
                Alert.alert('오류', e.response?.data?.message || '신청 실패');
              } finally { setLoading(false); }
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.grayLight }}>
      <View style={[styles.imgBox, { backgroundColor: st.bg }]}>
        <Text style={{ fontSize: 80 }}>{emoji}</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Card>
          <Text style={styles.modelName}>{item.modelName}</Text>
          <Text style={styles.serial}>{item.serialNumber} · {item.category?.name}</Text>
          <Badge label={st.label} color={st.color} bg={st.bg} />
          <Divider />
          {[
            ['최대 대여 기간', `${item.maxRentalDays || 7}일`],
            ['시리얼 번호',   item.serialNumber],
            ['카테고리',      item.category?.name],
            ['담당 관리자',   item.managedBy?.name || '-'],
          ].map(([k, v]) => (
            <View key={k} style={styles.detailRow}>
              <Text style={styles.detailKey}>{k}</Text>
              <Text style={styles.detailVal}>{v}</Text>
            </View>
          ))}
        </Card>

        {/* 대여 가능 + QR 있을 때 */}
        {item.status === 'AVAILABLE' && item.qrCodeUrl && (
          <View>
            <View style={styles.scanGuideBox}>
              <Text style={styles.scanGuideText}>
                📷 기자재에 부착된 QR 코드를 스캔하여 대여를 진행합니다.
              </Text>
            </View>
            <Button
              title="QR 스캔하여 대여하기"
              onPress={handleRentPress}
              style={{ marginBottom: 10 }}
            />
          </View>
        )}

        {/* QR 없을 때 */}
        {item.status === 'AVAILABLE' && !item.qrCodeUrl && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ QR 코드가 없어 대여할 수 없습니다.{'\n'}관리자에게 문의하세요.
            </Text>
          </View>
        )}

        {/* 대여 중 — 예약 대기 버튼 */}
        {item.status === 'RENTED' && (
          <View>
            <View style={styles.rentedBox}>
              <Text style={styles.rentedText}>현재 다른 사람이 대여 중입니다.</Text>
              {waitInfo.count > 0 && (
                <Text style={styles.waitCountText}>대기 인원: {waitInfo.count}명</Text>
              )}
            </View>
            <Button
              title={waitInfo.isWaiting ? '예약 대기 취소' : '예약 대기 신청'}
              onPress={handleWaitlist}
              loading={loading}
              style={{
                marginBottom: 10,
                backgroundColor: waitInfo.isWaiting ? COLORS.red : COLORS.orange,
              }}
            />
          </View>
        )}

        {/* 수리 중 */}
        {item.status === 'REPAIRING' && (
          <View style={styles.repairBox}>
            <Text style={styles.repairText}>현재 수리 중인 기자재입니다.</Text>
          </View>
        )}

        {/* 고장/파손 신고 */}
        <OutlineButton
          title="고장/파손 신고"
          onPress={() => navigation.navigate('DamageReport', { equipmentId: id })}
          color={COLORS.red}
          style={{ marginTop: 4 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  imgBox:        { height: 200, alignItems: 'center', justifyContent: 'center' },
  modelName:     { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  serial:        { fontSize: 13, color: COLORS.gray, marginBottom: 8 },
  detailRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  detailKey:     { fontSize: 14, color: COLORS.gray },
  detailVal:     { fontSize: 14, fontWeight: '500', color: COLORS.text },
  scanGuideBox:  { backgroundColor: COLORS.mintLight, borderRadius: 10, padding: 12, marginBottom: 10 },
  scanGuideText: { fontSize: 13, color: '#085041', lineHeight: 20 },
  warningBox:    { backgroundColor: COLORS.warningLight, borderRadius: 10, padding: 14, marginBottom: 10, alignItems: 'center' },
  warningText:   { fontSize: 13, color: '#633806', fontWeight: '500', textAlign: 'center', lineHeight: 20 },
  rentedBox:     { backgroundColor: COLORS.redLight, borderRadius: 10, padding: 12, marginBottom: 10, alignItems: 'center' },
  rentedText:    { fontSize: 13, color: COLORS.red, fontWeight: '500' },
  waitCountText: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  repairBox:     { backgroundColor: COLORS.warningLight, borderRadius: 10, padding: 12, marginBottom: 10, alignItems: 'center' },
  repairText:    { fontSize: 13, color: COLORS.warning, fontWeight: '500' },
});