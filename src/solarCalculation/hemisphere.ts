import { Cartesian3 } from '@vcmap-cesium/engine';

export type HemispherePoint = {
  hemispherePoint: Cartesian3;
  azimuth: number;
  zenith: number;
  skySectorArea: number;
  weightDiff: number;
  calibrationValue?: number;
  countPoints?: number;
  portionDiff?: number;
  calibrationDiffrad?: number;
};

function calibrateHemisphere(
  hemisphere: HemispherePoint[],
  countPoints: number,
): void {
  hemisphere.forEach((p) => {
    p.calibrationValue = Math.cos(1.5707963267949 - p.zenith);
    p.countPoints = countPoints;
    p.portionDiff = 1.0 / countPoints / p.weightDiff;
    p.calibrationDiffrad = p.weightDiff * Math.cos(1.5707963267949 - p.zenith);
  });
}

function calibrateDiffRad(hemisphere: HemispherePoint[]): void {
  const sum = hemisphere
    .map((p) => {
      return p.calibrationDiffrad ? p.calibrationDiffrad : 0;
    })
    .reduce((acc, cur) => {
      return acc + cur;
    });
  hemisphere.forEach((p) => {
    p.calibrationDiffrad = sum;
  });
}

export function createHemisphere(
  stepAzimuthInput: number,
  stepZenithInput: number,
  angOffset: number,
  radius: number,
  center: Cartesian3,
): HemispherePoint[] {
  const hemispherePoints: HemispherePoint[] = [];
  const countZenith = Math.round(Math.PI / 2 / stepZenithInput);
  let countAzimuth = Math.round((Math.PI * 2) / stepAzimuthInput);

  const stepZenith = Math.PI / 2 / countZenith;
  let stepAzimuth = (Math.PI * 2) / countAzimuth;

  const zenithAdd = stepZenith / 2;
  let zenith = zenithAdd;
  let azimuth = 0;

  let distCord = Math.cos(zenith) * radius;
  let circumference = 4 * distCord * Math.PI;
  const azimuthPointDistance = circumference / countAzimuth;
  const areaHalfdome = 2 * radius ** 2 * Math.PI;

  for (let i = 1; i <= countZenith; i++) {
    for (let j = 1; j <= countAzimuth; j++) {
      let zenithN = 0;
      let zenithP = Math.PI / 2;

      if (zenith - zenithAdd >= 0) {
        zenithN = zenith - zenithAdd;
      }

      if (zenith + zenithAdd <= Math.PI / 2) {
        zenithP = zenith + zenithAdd;
      }

      const heightN = radius - Math.sin(zenithN) * radius;
      const heightP = radius - Math.sin(zenithP) * radius;
      const diff = heightN - heightP;
      const beltArea = 2 * radius * diff * Math.PI;
      const skySectorArea = beltArea / (areaHalfdome * countAzimuth);
      const weightDiff =
        (2 * Math.cos(zenithN) +
          Math.cos(2 * zenithN) -
          2 * Math.cos(zenithP) -
          Math.cos(2 * zenithP)) /
        (4 * countAzimuth);

      const x = center.x + distCord * Math.sin(azimuth);
      const y = center.y + distCord * Math.cos(azimuth);
      const z = center.z + radius * Math.sin(zenith);
      const hemispherePoint = new Cartesian3(x, y, z);

      hemispherePoints.push({
        hemispherePoint,
        azimuth,
        zenith,
        skySectorArea,
        weightDiff,
      });
      azimuth += stepAzimuth;
    }
    azimuth = Math.PI * 2 - azimuth + angOffset * i;
    zenith += stepZenith;
    distCord = Math.cos(zenith) * radius;
    circumference = 2 * distCord * Math.PI;
    countAzimuth = Math.round(circumference / azimuthPointDistance);
    stepAzimuth = (Math.PI * 2) / countAzimuth;
  }
  const countPoints = hemispherePoints.length;

  calibrateHemisphere(hemispherePoints, countPoints);
  calibrateDiffRad(hemispherePoints);

  return hemispherePoints;
}
