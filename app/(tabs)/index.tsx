'use client';

import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type AQIData = {
  aqi: number | null;
  pm25: number | null;
};

type LocationData = {
  name: string;
  data: AQIData;
};

const TOKEN = "4c3ea47ca4c71c2ddfa6b7ba6348f6a84eca4a25";

// ======================
// 🌍 WAQI API
// ======================
const fetchCityAQI = async (keyword: string) => {
  try {
    const search = await fetch(
      `https://api.waqi.info/search/?token=${TOKEN}&keyword=${keyword}`
    );

    const searchData = await search.json();
    const uids = (searchData.data || [])
      .slice(0, 5)
      .map((i: any) => Number(i.uid))
      .filter((uid: number) => Number.isFinite(uid));

    const results = await Promise.all(
        uids.map(async (uid: number) => {
        const res = await fetch(
          `https://api.waqi.info/feed/@${uid}/?token=${TOKEN}`
        );
        const data = await res.json();
        if (data.status !== "ok") return null;

        return {
          aqi: data.data.aqi,
          pm25: data.data.iaqi?.pm25?.v ?? null,
        };
      })
    );

    const valid = results.filter(
      (r): r is { aqi: number; pm25: number | null } =>
        r !== null &&
        typeof r.aqi === "number" &&
        !isNaN(r.aqi)
    );

    const avg = (arr: number[]) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b) / arr.length) : null;

    return {
      aqi: avg(valid.map(v => v.aqi!).filter(Boolean)),
      pm25: avg(valid.map(v => v.pm25!).filter(Boolean)),
    };
  } catch {
    return null;
  }
};

// ======================
// 🎨 UI Color
// ======================
const getColor = (aqi: number | null) => {
  if (!aqi) return '#999';
  if (aqi <= 50) return '#34C759';
  if (aqi <= 100) return '#FFCC00';
  if (aqi <= 150) return '#FF9500';
  return '#FF3B30';
};

export default function Page() {
  const [data, setData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const [douliu, dallas] = await Promise.all([
        fetchCityAQI("douliu"),
        fetchCityAQI("dallas"),
      ]);

      setData([
        { name: "Douliu 斗六 ", data: douliu! },
        { name: "Dallas 達拉斯 ", data: dallas! },
      ]);

      setLoading(false);
    };

    run();
  }, []);

  const douliu = data[0]?.data?.aqi ?? null;
  const dallas = data[1]?.data?.aqi ?? null;
  const getResultText = (tw: string, en: string) => {
    return `${en} / ${tw}`;
  };

  const result =
    douliu && dallas
      ? douliu > dallas
        ? getResultText("斗六空氣較差", "Douliu has worse air quality")
        : getResultText("達拉斯空氣較差", "Dallas has worse air quality")
      : "";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Air Quality</Text>

      {/* 📊 結論卡 */}
      {result !== "" && (
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}

      {/* 🍎 cards */}
      <View style={styles.grid}>
        {data.map((item) => (
          <View key={item.name} style={styles.card}>
            <Text style={styles.city}>{item.name}</Text>

            <Text
              style={[
                styles.aqi,
                { color: getColor(item.data?.aqi ?? null) },
              ]}
            >
              {item.data?.aqi ?? "-"}
            </Text>

            <Text style={styles.label}>AQI</Text>

            <Text style={styles.sub}>
              PM2.5: {item.data?.pm25 ?? "-"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ======================
// 🎨 Apple style UI
// ======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 20,
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  city: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },

  aqi: {
    fontSize: 48,
    fontWeight: 'bold',
  },

  label: {
    color: '#aaa',
    marginTop: 5,
  },

  sub: {
    color: '#ccc',
    marginTop: 10,
  },

  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },

  resultText: {
    color: '#fff',
    fontSize: 16,
  },
});