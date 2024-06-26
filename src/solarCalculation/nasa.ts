import NasaNotAvailableError from './nasaNotAvailableError.js';

const months = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

export default async function getNASAdata(
  lon: number,
  lat: number,
): Promise<number[][]> {
  const calibData: number[][] = [];
  const uri = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DIFF&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`;

  const response = await fetch(uri);
  if (!response.ok) {
    throw new NasaNotAvailableError('solarRevenue.nasa', response);
  }
  const nasa = await response.json();
  const diff = nasa.properties.parameter.ALLSKY_SFC_SW_DIFF;
  const global = nasa.properties.parameter.ALLSKY_SFC_SW_DWN;

  Object.entries(global).forEach(([key, value]) => {
    if (months.indexOf(key.toLowerCase()) >= 0) {
      const month = months.indexOf(key.toLowerCase());
      calibData[month] = [];
      const trans = 0.3;
      const globalRad = value as number;
      const diffuseRad = diff[key];
      const directRad = globalRad - diffuseRad;
      const diffuseAmount = diffuseRad / globalRad;
      calibData[month][0] = trans;
      calibData[month][1] = globalRad;
      calibData[month][2] = diffuseRad;
      calibData[month][3] = directRad;
      calibData[month][4] = diffuseAmount;
    }
  });

  return calibData;
}
