import SunCalc from 'suncalc';
import { cartesianToMercator, Projection } from '@vcmap/core';
import { Cartesian3 } from '@vcmap-cesium/engine';
import { Coordinate } from 'ol/coordinate';

export type SunPoint = {
  sunPoint: Cartesian3;
  azimuth: number;
  altitude: number;
  zenith: number;
  date: Date;
  optPathLength?: number;
  directRad?: number;
  directRadHorizon?: number;
  diffuseRad?: number;
  diffuseRadHorizon?: number;
};

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function createSun(centerPoint: Cartesian3): SunPoint[] {
  const coord: Coordinate = [centerPoint.x, centerPoint.y, centerPoint.z];
  const wgsCenter = Projection.mercatorToWgs84(coord);
  const sunPoints: SunPoint[] = [];
  const currentDate = new Date();
  currentDate.setDate(15);
  currentDate.setMinutes(0);
  for (let i = 0; i < 12; i++) {
    currentDate.setMonth(i);
    const currentTimes = SunCalc.getTimes(
      currentDate,
      wgsCenter[1],
      wgsCenter[0],
    );
    const sunRise = currentTimes.sunrise.getHours();
    const sunSet = currentTimes.sunset.getHours() + 1;
    for (let j = sunRise; j <= sunSet; j++) {
      currentDate.setHours(j);
      const sunPosition = SunCalc.getPosition(
        currentDate,
        wgsCenter[1],
        wgsCenter[0],
      );
      const distCord = 1000000.0;
      const x =
        centerPoint.x +
        distCord * Math.cos(sunPosition.azimuth * -1.0 - Math.PI / 2);
      const y =
        centerPoint.y +
        distCord * Math.sin(sunPosition.azimuth * -1.0 - Math.PI / 2);
      const z = centerPoint.z + distCord * Math.sin(sunPosition.altitude);
      const sunPoint = new Cartesian3(x, y, z);
      sunPoints.push({
        sunPoint,
        azimuth: sunPosition.azimuth,
        altitude: sunPosition.altitude,
        zenith: Math.PI / 2 - sunPosition.altitude,
        date: new Date(currentDate),
      });
    }
  }
  return sunPoints;
}

export function calcSunRadiation(
  sunPoints: SunPoint[],
  calibData: number[][],
  calibDiffRad: number,
  centerPoint: Cartesian3,
): void {
  sunPoints.forEach((sunPoint) => {
    const { zenith } = sunPoint;
    const mer = cartesianToMercator(centerPoint);
    const elev = mer[2];
    let m;
    let prod = 0.0;
    let directRad = 0.0;
    let diffuseRad = 0.0;
    let directRadHoriz = 0.0;
    const transmissivity = calibData[sunPoint.date.getMonth()][0];
    const diffuseAmount = calibData[sunPoint.date.getMonth()][4];
    if (zenith < Math.PI / 2.0) {
      m = Math.exp(-1.18e-4 * elev - 1.638e-9 * elev * elev) / Math.cos(zenith);

      if (m < 25.0) {
        prod = transmissivity ** m;
      } else {
        prod = 0.0;
      }

      directRad =
        1.367 *
        prod *
        daysInMonth(sunPoint.date.getMonth() - 1, sunPoint.date.getFullYear());

      directRadHoriz = Math.cos(zenith) * directRad;
      diffuseRad = (directRadHoriz / (1 - diffuseAmount)) * diffuseAmount;
    } else {
      m = 0.0;
    }

    diffuseRad = (diffuseRad * 1.0) / calibDiffRad;
    const diffuseRadHoriz = diffuseRad * calibDiffRad;
    sunPoint.optPathLength = m;
    sunPoint.directRad = directRad;
    sunPoint.directRadHorizon = diffuseRadHoriz;
    sunPoint.diffuseRad = diffuseRad;
    sunPoint.diffuseRadHorizon = diffuseRadHoriz;
  });
}

function calcDirRadHoriz(sunPoint: SunPoint, transmissivity: number): number {
  let result = 0.0;
  if (sunPoint.optPathLength && sunPoint.optPathLength < 25) {
    result =
      Math.cos(sunPoint.zenith) *
      transmissivity ** sunPoint.optPathLength *
      1.367;
  }
  return result;
}

function interpolateTransmissivity(vals: number[]): number {
  let sign = 1;
  if (vals[0] < 0) {
    sign = -1;
  }
  return 0.001 * vals[1] * sign;
}

export function calibrate(sunPoints: SunPoint[], calibData: number[][]): void {
  const diff: number[][] = [];
  for (let month = 0; month < 12; month++) {
    diff[month] = [];
    let calibrated = false;
    do {
      const currentTransm = calibData[month][0];
      const sumDirRadHoriz = sunPoints
        .filter((p) => {
          return p.date.getMonth() === month;
        })
        .map((p) => {
          return calcDirRadHoriz(p, currentTransm);
        })
        .reduce((acc, cur) => acc + cur);
      diff[month][0] = calibData[month][3] - sumDirRadHoriz;
      diff[month][1] = (Math.abs(diff[month][0]) / calibData[month][3]) * 100;
      if (diff[month][1] <= 0.25) {
        calibrated = true;
      } else {
        calibData[month][0] += interpolateTransmissivity(diff[month]);
      }
    } while (!calibrated);
  }
}
