import { Cartesian3 } from '@vcmap-cesium/engine';

export default function direction(
  fromPoint: Cartesian3,
  toPoint: Cartesian3,
): Cartesian3 {
  return Cartesian3.subtract(toPoint, fromPoint, new Cartesian3());
}

export function getAzimuth(normal: Cartesian3): number {
  return Math.atan2(normal.x, normal.z);
}

export function getZenith(normal: Cartesian3): number {
  return Math.acos(normal.z);
}

export function incidenceAngle(
  surfAzimuth: number,
  surfZenith: number,
  skyAzimuth: number,
  skyZenith: number,
): number {
  return (
    Math.cos(skyZenith) * Math.cos(surfZenith) +
    Math.sin(skyZenith) *
      Math.sin(surfZenith) *
      Math.cos(skyAzimuth - surfAzimuth)
  );
}
