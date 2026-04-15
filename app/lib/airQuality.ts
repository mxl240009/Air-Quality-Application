export type AQIData = {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
};

type OpenAQMeasurement = {
  parameter: string;
  value: number;
};

type OpenAQResult = {
  measurements: OpenAQMeasurement[];
};

type OpenAQResponse = {
  results: OpenAQResult[];
};

const calcAqiFromPm25 = (pm25: number) => {
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
  if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
  if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
  if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
  if (pm25 <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
  return Math.round(((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401);
};

const findValue = (results: OpenAQResult[], parameter: string) =>
  results
    .flatMap((result) => result.measurements)
    .find((m) => m.parameter === parameter)
    ?.value ?? null;

export const getAQI = async (lat: number, lon: number): Promise<AQIData | null> => {
  const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=10000&limit=5&order_by=distance&sort=asc`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('OpenAQ API error', res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as OpenAQResponse;
  if (!data.results?.length) {
    console.error('OpenAQ no results');
    return null;
  }

  const pm25 = findValue(data.results, 'pm25');
  const pm10 = findValue(data.results, 'pm10');
  const o3 = findValue(data.results, 'o3');

  return {
    aqi: pm25 !== null ? calcAqiFromPm25(pm25) : null,
    pm25,
    pm10,
    o3,
  };
};