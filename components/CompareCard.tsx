import { StyleSheet, Text, View } from 'react-native';

type CardProps = {
  city: string;
  data: {
    aqi: number | null;
    pm25: number | null;
    pm10: number | null;
    o3: number | null;
  };
};

const getAQIColor = (aqi: number | null) => {
  if (!aqi) return '#888';
  if (aqi <= 50) return '#34C759';
  if (aqi <= 100) return '#FFCC00';
  if (aqi <= 150) return '#FF9500';
  return '#FF3B30';
};

const getAQIStatus = (aqi: number | null) => {
  if (aqi == null) return { en: 'No Data', zh: '無資料' };
  if (aqi <= 50) return { en: 'Good', zh: '良好' };
  if (aqi <= 100) return { en: 'Moderate', zh: '普通' };
  if (aqi <= 150) return { en: 'Unhealthy for Sensitive Groups', zh: '對敏感族群不健康' };
  return { en: 'Unhealthy', zh: '不健康' };
};

export default function CompareCard({ city, data }: CardProps) {
  const aqi = data.aqi;
  const color = getAQIColor(aqi);
  const status = getAQIStatus(aqi);

  return (
    <View style={styles.card}>
      {/* 城市 */}
      <Text style={styles.city}>{city}</Text>

      {/* AQI */}
      <Text style={[styles.aqi, { color }]}>
        {aqi ?? '—'}
      </Text>

      <Text style={styles.label}>AQI / 空氣品質指數</Text>

      {/* PM */}
      <Text style={styles.sub}>
        PM2.5: {data.pm25 ?? '—'} μg/m³
      </Text>

      <Text style={styles.sub}>
        PM10: {data.pm10 ?? '—'} μg/m³
      </Text>

      {/* 狀態（中英文） */}
      <Text style={[styles.status, { color }]}>
        {status.en} / {status.zh}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 20,
    margin: 10,
    width: 170,
  },

  city: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 6,
  },

  aqi: {
    fontSize: 52,
    fontWeight: '700',
  },

  label: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },

  sub: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 6,
  },

  status: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
  },
});