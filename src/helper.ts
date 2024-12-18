import { Feature } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { Projection } from '@vcmap/core';
import { Polygon } from 'ol/geom';
import { area, polygon, Position } from '@turf/turf';
import { isDark, VcsUiApp } from '@vcmap/ui';
import { SolarDiagramColors, SolarOptions } from './solarOptions.js';

export function deepDiff<T extends Record<string, unknown>>(
  defaultObject: Partial<T>,
  changeObject: Partial<T>,
): Partial<T> {
  const differences: Partial<T> = {} as Partial<T>;
  const keys = new Set<keyof T>([
    ...Object.keys(defaultObject),
    ...Object.keys(changeObject),
  ]);

  for (const key of keys) {
    const value1 = defaultObject[key];
    const value2 = changeObject[key];

    if (
      typeof value1 === 'object' &&
      typeof value2 === 'object' &&
      !Array.isArray(value1) &&
      value1 !== null &&
      !Array.isArray(value2) &&
      value2 !== null
    ) {
      const nestedDifferences = deepDiff(value1, value2);
      if (Object.keys(nestedDifferences).length > 0) {
        differences[key] = nestedDifferences as T[typeof key];
      }
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
      if (
        value1.length !== value2.length ||
        JSON.stringify(value1) !== JSON.stringify(value2)
      ) {
        differences[key] = value2 as T[keyof T];
      }
    } else if (
      value2 !== undefined &&
      typeof value1 !== 'function' &&
      typeof value2 !== 'function' &&
      value1 !== value2
    ) {
      differences[key] = value2 as T[keyof T];
    }
  }
  return differences;
}

export function configWithDefaults(
  defaultObject: SolarOptions,
  config: DeepPartial<SolarOptions>,
): SolarOptions {
  Object.keys(defaultObject).forEach((k) => {
    const key = k as keyof SolarOptions;
    config[key] = Object.assign(defaultObject[key], config[key]);
  });
  return config as SolarOptions;
}

export function deepMerge<T extends Record<string, unknown>>(
  defaultObject: Partial<T>,
  changeObject: Partial<T>,
): T {
  const merged: Partial<T> = { ...defaultObject };
  const keys = new Set([
    ...Object.keys(defaultObject),
    ...Object.keys(changeObject),
  ]) as Set<keyof T>;

  for (const key of keys) {
    const value1 = defaultObject[key];
    const value2 = changeObject[key];

    if (
      typeof value1 === 'object' &&
      typeof value2 === 'object' &&
      !Array.isArray(value1) &&
      value1 !== null &&
      !Array.isArray(value2) &&
      value2 !== null
    ) {
      merged[key] = deepMerge(value1, value2) as T[typeof key];
    } else if (value2 !== undefined) {
      merged[key] = value2 as T[typeof key];
    }
  }
  return merged as T;
}

type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export function filterObject<T extends object>(
  obj: T,
  fn: (entry: Entry<T>, i: number, arr: Entry<T>[]) => boolean,
): Partial<T> {
  return Object.fromEntries(
    (Object.entries(obj) as Entry<T>[]).filter(fn),
  ) as Partial<T>;
}

export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

export function roundCommercial(num: number): number {
  const m = Number((Math.abs(num) * 100).toPrecision(15));
  return Number((Math.round(m) / 100) * Math.sign(num));
}

export const downloadSVG =
  '<svg\n' +
  '    xmlns="http://www.w3.org/2000/svg"\n' +
  '    width="16"\n' +
  '    height="16"\n' +
  '    viewBox="0 0 16 16"\n' +
  '  >\n' +
  '    <g id="Group_860" transform="translate(10 0) rotate(90)">\n' +
  '      <circle\n' +
  '        id="Ellipse_40"\n' +
  '        cx="2"\n' +
  '        cy="2"\n' +
  '        r="2"\n' +
  '        transform="translate(0 0)"\n' +
  '        fill="currentColor"\n' +
  '      />\n' +
  '      <circle\n' +
  '        id="Ellipse_41"\n' +
  '        cx="2"\n' +
  '        cy="2"\n' +
  '        r="2"\n' +
  '        transform="translate(6 0)"\n' +
  '        fill="currentColor"\n' +
  '      />\n' +
  '      <circle\n' +
  '        id="Ellipse_42"\n' +
  '        cx="2"\n' +
  '        cy="2"\n' +
  '        r="2"\n' +
  '        transform="translate(12 0)"\n' +
  '        fill="currentColor"\n' +
  '      />\n' +
  '    </g>\n' +
  '    <rect id="size" width="16" height="16" fill="none" />\n' +
  '  </svg>';

export function sumValues(numbers: number[]): number {
  return numbers.length > 0 ? numbers.reduce((a, b) => a + b) : 0;
}

export function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function mercatorCoordinatesToWgs84(
  feature: Feature<Polygon>,
): Feature<Polygon> {
  const coordinates = feature.getGeometry()?.getCoordinates();
  const transformedCoordinates: Array<Array<Coordinate>> = [];
  coordinates?.forEach((position) => {
    const positionCoordinates: Array<Coordinate> = [];
    position.forEach((c) => {
      const coord2D: Coordinate = [c[0], c[1]];
      positionCoordinates.push(Projection.mercatorToWgs84(coord2D));
    });
    positionCoordinates.push(positionCoordinates[0]);
    transformedCoordinates.push(positionCoordinates);
  });
  return new Feature<Polygon>({
    geometry: new Polygon(transformedCoordinates),
  });
}

export function extentToWgs84(extent: Array<number>): Array<number> {
  const ll: Coordinate = [extent[0], extent[1]];
  const ur: Coordinate = [extent[2], extent[3]];
  return [...Projection.mercatorToWgs84(ll), ...Projection.mercatorToWgs84(ur)];
}

export function turfArea(feature: Feature<Polygon>): number {
  const turfPoly = polygon(
    mercatorCoordinatesToWgs84(feature)
      .getGeometry()
      ?.getCoordinates() as Position[][],
  );
  return area(turfPoly);
}

function getColorBySingleKey(app: VcsUiApp, key: string): string {
  return app.vuetify.theme.current.value.colors[key];
}

export function getSolarColorByKey(
  app: VcsUiApp,
  colors: SolarDiagramColors,
  key: keyof SolarDiagramColors,
): string {
  return (
    colors[key]?.[isDark(app) ? 'dark' : 'light'] ??
    getColorBySingleKey(app, colors[key].default) ??
    '#000000'
  );
}
