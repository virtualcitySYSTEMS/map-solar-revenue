import { LineString, Point, Polygon } from 'ol/geom';
import {
  cartesianToMercator,
  CesiumMap,
  mercatorToCartesian,
  Projection,
  VectorLayer,
  VectorStyleItem,
} from '@vcmap/core';
import { Camera, Cartesian3, Matrix3, Plane } from '@vcmap-cesium/engine';
import { Feature } from 'ol';
import {
  BBox,
  centerOfMass,
  hexGrid,
  inside,
  polygon,
  Position,
  Units,
} from '@turf/turf';
import { Coordinate } from 'ol/coordinate';
import { Stroke, Style } from 'ol/style';
import { NotificationType, VcsUiApp } from '@vcmap/ui';
import {
  extentToWgs84,
  mercatorCoordinatesToWgs84,
  timeout,
  turfArea,
} from '../../helper.js';
import {
  calcSunRadiation,
  calibrate,
  createSun,
  SunPoint,
} from '../../solarCalculation/sun.js';
import {
  createHemisphere,
  HemispherePoint,
} from '../../solarCalculation/hemisphere.js';
import getNASAdata from '../../solarCalculation/nasa.js';
import SunRay from '../../solarCalculation/sunRay.js';
import {
  SolarCalculationProgress,
  SolarModule,
} from '../../solarInputTypes.js';
import HemisphereRay from '../../solarCalculation/hemisphereRay.js';

export type SurfacePoint = {
  area: number;
  directRad: number[];
  diffuseRad: number[];
  globalRad: number[];
  surfacePointFeature?: Feature<Point>;
  sunRayFeatures?: Feature<LineString>[];
  hemisphereRayFeatures?: Feature<LineString>[];
  gridFeature3D?: Feature<Polygon>;
  gridFeature2D?: Feature<Polygon>;
};

export type SolarSurface = {
  centerPoint: Cartesian3;
  solarArea: number;
  directRad: number;
  diffuseRad: number;
  globalRad: number;
  normal: Cartesian3;
  surfacePoints: SurfacePoint[];
  sunPoints?: SunPoint[];
  hemispherePoints?: HemispherePoint[];
  surfaceFeature: Feature<Polygon>;
};

export function nRotationMatrix(
  zenith: number,
  rotationVector: Cartesian3,
): Matrix3 {
  return new Matrix3(
    rotationVector.x ** 2 * (1 - Math.cos(zenith)) + Math.cos(zenith),
    rotationVector.x * rotationVector.y * (1 - Math.cos(zenith)) -
      rotationVector.z * Math.sin(zenith),
    rotationVector.x * rotationVector.z * (1 - Math.cos(zenith)) +
      rotationVector.y * Math.sin(zenith),
    rotationVector.y * rotationVector.x * (1 - Math.cos(zenith)) +
      rotationVector.z * Math.sin(zenith),
    rotationVector.y ** 2 * (1 - Math.cos(zenith)) + Math.cos(zenith),
    rotationVector.y * rotationVector.z * (1 - Math.cos(zenith)) -
      rotationVector.x * Math.sin(zenith),
    rotationVector.z * rotationVector.x * (1 - Math.cos(zenith)) -
      rotationVector.y * Math.sin(zenith),
    rotationVector.z * rotationVector.y * (1 - Math.cos(zenith)) +
      rotationVector.x * Math.sin(zenith),
    rotationVector.z ** 2 * (1 - Math.cos(zenith)) + Math.cos(zenith),
  );
}

export function getNRotationVector(
  center: Cartesian3,
  normal: Cartesian3,
): Cartesian3 {
  const v = Cartesian3.cross(
    Cartesian3.normalize(normal, new Cartesian3()),
    Cartesian3.normalize(center, new Cartesian3()),
    new Cartesian3(),
  );
  return Cartesian3.normalize(v, new Cartesian3());
}

export function normalVector(feature: Feature<Polygon>): Cartesian3 {
  const coordinates = feature.getGeometry()?.getCoordinates();
  if (coordinates) {
    const a = mercatorToCartesian(coordinates[0][1]);
    const b = mercatorToCartesian(coordinates[0][2]);
    const c = mercatorToCartesian(coordinates[0][0]);

    const ab = Cartesian3.subtract(b, a, new Cartesian3());

    const ac = Cartesian3.subtract(c, a, new Cartesian3());

    const normal = Cartesian3.cross(ab, ac, new Cartesian3());

    return Cartesian3.normalize(normal, new Cartesian3());
  } else {
    return new Cartesian3();
  }
}

export function calculateCenterPoint(feature: Feature<Polygon>): Cartesian3 {
  const coordinates = feature.getGeometry()?.getCoordinates();
  const xCoords: number[] = [];
  const yCoords: number[] = [];
  const zCoords: number[] = [];
  coordinates?.forEach((position) => {
    position.forEach((c) => {
      xCoords.push(c[0]);
      yCoords.push(c[1]);
      zCoords.push(c[2]);
    });
  });
  const centerX: number = (Math.max(...xCoords) + Math.min(...xCoords)) / 2;
  const centerY: number = (Math.max(...yCoords) + Math.min(...yCoords)) / 2;
  const centerZ: number = (Math.max(...zCoords) + Math.min(...zCoords)) / 2;

  return mercatorToCartesian([centerX, centerY, centerZ]);
}

export function rotateTo2D(matrix: Matrix3, point: Cartesian3): Cartesian3 {
  return Matrix3.multiplyByVector(matrix, point, new Cartesian3());
}

export function translateTo3D(
  point: Cartesian3,
  center: Cartesian3,
): Cartesian3 {
  return Cartesian3.add(point, center, new Cartesian3());
}

export function translateTo2D(
  point: Cartesian3,
  center: Cartesian3,
): Cartesian3 {
  return Cartesian3.subtract(point, center, new Cartesian3());
}

export function flattenFeature(
  feature: Feature<Polygon>,
  center: Cartesian3,
  normal: Cartesian3,
  isInverse: boolean,
): Feature<Polygon> {
  const zenith = Cartesian3.angleBetween(normal, center);
  const nVector = getNRotationVector(center, normal);
  const nMatrix = isInverse
    ? nRotationMatrix(-1.0 * zenith, nVector)
    : nRotationMatrix(zenith, nVector);
  const flattCoordinates: Coordinate[] = [];

  feature
    .getGeometry()
    ?.getCoordinates()[0]
    .forEach((coord) => {
      const cart = translateTo2D(mercatorToCartesian(coord), center);
      const rotatedCoord = rotateTo2D(nMatrix, cart);
      const translated = translateTo3D(rotatedCoord, center);
      const mercatorTranslated = cartesianToMercator(translated);
      flattCoordinates.push(mercatorTranslated);
    });
  const flattFeature = new Feature({
    geometry: new Polygon([flattCoordinates]),
  });

  const lineStyle: Style = new Style({
    stroke: new Stroke({ color: '#FF61F4', width: 3 }),
  });
  flattFeature.setStyle(lineStyle);
  return flattFeature;
}

export function modulesFromArea(
  gridOutlinePolygon: Feature<Polygon>,
  center: Cartesian3,
  gridSize: number,
): Feature<Polygon>[] {
  const gridFeatures: Feature<Polygon>[] = [];
  const extent = gridOutlinePolygon?.getGeometry()?.getExtent();
  if (extent) {
    const turfPoly = polygon(
      mercatorCoordinatesToWgs84(gridOutlinePolygon)
        .getGeometry()
        ?.getCoordinates() as Position[][],
    );
    const options = {
      units: 'meters' as Units,
      mask: turfPoly,
    };

    const grid = hexGrid(extentToWgs84(extent) as BBox, gridSize, options);
    grid.features.forEach((feature) => {
      if (inside(centerOfMass(feature), turfPoly)) {
        const featureCoordinates: Array<Array<Coordinate>> = [];
        feature.geometry.coordinates.forEach((position) => {
          const positionCoordinates: Array<Coordinate> = [];
          position.forEach((subPosition) => {
            const c = Projection.wgs84ToMercator(subPosition);
            c.push(cartesianToMercator(center)[2] + 0.3);
            positionCoordinates.push(c);
          });
          featureCoordinates.push(positionCoordinates);
        });
        const gridFeature = new Feature({
          geometry: new Polygon(featureCoordinates),
        });
        const lineStyle: Style = new Style({
          stroke: new Stroke({ color: '#00FF00', width: 1 }),
        });

        gridFeature.setStyle(lineStyle);
        gridFeatures.push(gridFeature);
      }
    });
  }
  return gridOutlinePolygon ? gridFeatures : [];
}

export function accumSolarRad(
  solarSurface: SolarSurface,
  solarModule: SolarModule,
): void {
  let directRadSurface = 0;
  let diffuseRadSurface = 0;
  if (solarSurface.surfacePoints) {
    solarSurface.surfacePoints.forEach((surfacePoint) => {
      surfacePoint.directRad.forEach((directRad) => {
        directRadSurface += directRad;
      });
      surfacePoint.diffuseRad.forEach((diffuseRad) => {
        diffuseRadSurface += diffuseRad;
      });
    });
  }
  solarSurface.diffuseRad = diffuseRadSurface > 0 ? diffuseRadSurface : 0;
  solarSurface.directRad = directRadSurface > 0 ? directRadSurface : 0;
  solarSurface.globalRad = solarSurface.diffuseRad + solarSurface.directRad;
  solarModule.solarIrradiation = solarSurface.globalRad;
}

async function createSunHemisphere(solarSurface: SolarSurface): Promise<void> {
  const skyCenter = cartesianToMercator(solarSurface.centerPoint);
  const skyCenterCartesianType = new Cartesian3(
    skyCenter[0],
    skyCenter[1],
    skyCenter[2],
  );
  const wgsCenter = Projection.mercatorToWgs84(
    cartesianToMercator(solarSurface.centerPoint),
  );
  const sunPoints = createSun(skyCenterCartesianType);
  const hemispherePoints = createHemisphere(
    0.21,
    0.157,
    0.05,
    1000000,
    skyCenterCartesianType,
  );

  const calibData = await getNASAdata(wgsCenter[0], wgsCenter[1]);
  calcSunRadiation(
    sunPoints,
    calibData,
    hemispherePoints[0].calibrationDiffrad || 0,
    solarSurface.centerPoint,
  );
  calibrate(sunPoints, calibData);
  calcSunRadiation(
    sunPoints,
    calibData,
    hemispherePoints[0].calibrationDiffrad || 0,
    solarSurface.centerPoint,
  );
  solarSurface.sunPoints = sunPoints;
  solarSurface.hemispherePoints = hemispherePoints;
}

export function createSolarSurface(
  surfaceFeature: Feature<Polygon>,
  app: VcsUiApp,
): SolarSurface {
  const centerPoint = calculateCenterPoint(surfaceFeature);

  let normal = normalVector(surfaceFeature);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const activeScene = (app.maps.activeMap as CesiumMap).getScene();
  let cameraPosition = new Cartesian3();
  if (activeScene) {
    cameraPosition = new Camera(activeScene).direction;
  }

  const featurePlane = Plane.fromPointNormal(centerPoint, normal);
  const distance = Plane.getPointDistance(featurePlane, cameraPosition);

  if (distance > 0) {
    const reversedCoordinates = surfaceFeature
      .getGeometry()
      ?.getCoordinates()[0]
      .toReversed();
    if (reversedCoordinates) {
      surfaceFeature.getGeometry()?.setCoordinates([reversedCoordinates]);
      normal = normalVector(surfaceFeature);
    }
  }

  const flattFeature = flattenFeature(
    surfaceFeature,
    centerPoint,
    normal,
    false,
  );
  const solarArea = turfArea(flattFeature);
  const gridSize = solarArea < 50 ? 1 : solarArea / 50;

  const gridFeatures: Feature<Polygon>[] = modulesFromArea(
    flattFeature,
    centerPoint,
    gridSize,
  );

  const surfacePoints: SurfacePoint[] = [];

  if (gridFeatures.length > 1) {
    const surfacePointArea = solarArea / gridFeatures.length;
    gridFeatures.forEach((gridFeature2D) => {
      const gridFeature3D = flattenFeature(
        gridFeature2D,
        centerPoint,
        normal,
        true,
      );
      const surfacePointCenter = calculateCenterPoint(gridFeature3D);
      const surfacePointFeature = new Feature({
        geometry: new Point(cartesianToMercator(surfacePointCenter)),
      });

      const surfacePoint: SurfacePoint = {
        area: surfacePointArea,
        directRad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        diffuseRad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        globalRad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        surfacePointFeature,
        gridFeature3D,
        gridFeature2D,
      };

      surfacePoints.push(surfacePoint);
    });
  } else {
    const surfacePointCenter = calculateCenterPoint(surfaceFeature);
    const normalOffset = Cartesian3.multiplyByScalar(
      normal,
      0.3,
      new Cartesian3(),
    );
    const surfacePointCenterOffset = Cartesian3.add(
      surfacePointCenter,
      normalOffset,
      new Cartesian3(),
    );
    const surfacePointFeature = new Feature({
      geometry: new Point(cartesianToMercator(surfacePointCenterOffset)),
    });

    const surfacePoint: SurfacePoint = {
      area: solarArea,
      directRad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      diffuseRad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      globalRad: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      surfacePointFeature,
    };

    surfacePoints.push(surfacePoint);
  }

  return {
    centerPoint,
    directRad: 0,
    diffuseRad: 0,
    globalRad: 0,
    solarArea,
    normal,
    surfacePoints,
    surfaceFeature,
  };
}

function updateSolarProgress(solarProgress: SolarCalculationProgress): void {
  solarProgress.progress =
    (solarProgress.numberCurrentRays / solarProgress.numberTotalRays) * 100;
}

export async function calculateDirectIrradiation(
  solarSurface: SolarSurface,
  app: VcsUiApp,
  solarProgress: SolarCalculationProgress,
  isDebug: boolean,
): Promise<void> {
  if (solarSurface.sunPoints && solarSurface.surfacePoints) {
    for (const surfacePoint of solarSurface.surfacePoints) {
      let currentIntersectionsCount = 0;
      const sunRayFeatures: Feature<LineString>[] = [];
      surfacePoint.directRad = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (const p of solarSurface.sunPoints) {
        const cartesianMercator = surfacePoint.surfacePointFeature
          ?.getGeometry()
          ?.getCoordinates();
        if (cartesianMercator) {
          const surfacePointMercator = new Cartesian3(
            cartesianMercator[0],
            cartesianMercator[1],
            cartesianMercator[2],
          );
          const sunRay = new SunRay(surfacePointMercator, p.sunPoint, app);
          sunRay.intersect();
          currentIntersectionsCount += 1;
          solarProgress.numberCurrentRays += 1;
          if (currentIntersectionsCount % 20 === 0) {
            // eslint-disable-next-line no-await-in-loop
            await timeout(0);
            updateSolarProgress(solarProgress);
          }
          const incidence = Math.cos(
            Cartesian3.angleBetween(solarSurface.normal, sunRay.direction),
          );
          if (isDebug) {
            sunRayFeatures.push(sunRay.createRayFeature());
          }

          if (sunRay.isNotIntersected) {
            const inRad = (p.directRad || 0) * incidence * surfacePoint.area;
            surfacePoint.directRad[p.date.getMonth()] += inRad;
          }
        }
      }
      if (isDebug) {
        surfacePoint.sunRayFeatures = sunRayFeatures;
      }
    }
  }
}

export async function calculateDiffuseIrradiation(
  solarSurface: SolarSurface,
  app: VcsUiApp,
  solarProgress: SolarCalculationProgress,
  isDebug: boolean,
): Promise<void> {
  if (solarSurface.surfacePoints && solarSurface.hemispherePoints) {
    for (const surfacePoint of solarSurface.surfacePoints) {
      let currentIntersectionsCount = 0;
      const hemisphereRayFeatures: Feature<LineString>[] = [];
      surfacePoint.diffuseRad = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let pointDiffRad = 0.0;
      for (const p of solarSurface.hemispherePoints) {
        const cartesianMercator = surfacePoint.surfacePointFeature
          ?.getGeometry()
          ?.getCoordinates();
        if (cartesianMercator) {
          const surfacePointMercator = new Cartesian3(
            cartesianMercator[0],
            cartesianMercator[1],
            cartesianMercator[2],
          );
          const hemisphereRay = new HemisphereRay(
            surfacePointMercator,
            p.hemispherePoint,
            app,
          );
          hemisphereRay.intersect();
          currentIntersectionsCount += 1;
          solarProgress.numberCurrentRays += 1;
          if (currentIntersectionsCount % 20 === 0) {
            // eslint-disable-next-line no-await-in-loop
            await timeout(0);
            updateSolarProgress(solarProgress);
          }
          const incidence = Math.cos(
            Cartesian3.angleBetween(
              solarSurface.normal,
              hemisphereRay.direction,
            ),
          );
          if (isDebug) {
            hemisphereRayFeatures.push(hemisphereRay.createRayFeature());
          }

          if (hemisphereRay.isNotIntersected) {
            pointDiffRad += incidence * p.weightDiff;
          }
        }
      }
      if (isDebug) {
        surfacePoint.hemisphereRayFeatures = hemisphereRayFeatures;
      }

      pointDiffRad *= surfacePoint.area;

      for (let month = 0; month < 12; month++) {
        let aggDiffRad = 0.0;
        if (solarSurface.sunPoints) {
          aggDiffRad = solarSurface.sunPoints
            .map((sp) => {
              return sp.date.getMonth() - 1 === month && sp.diffuseRad
                ? sp.diffuseRad
                : 0.0;
            })
            .reduce((acc, cur) => acc + cur);
        }
        surfacePoint.diffuseRad[month] = pointDiffRad * aggDiffRad;
      }
    }
  }
}

export async function calculateSolarAreaModule(
  solarAreaModule: SolarModule,
  app: VcsUiApp,
  isDebug: boolean,
): Promise<void> {
  if (solarAreaModule.solarSurface) {
    const action = solarAreaModule.actions?.find((act) => {
      return act.name === 'calculateSolarModule';
    });
    if (action) {
      action.icon = '$vcsProgress';
    }
    try {
      await createSunHemisphere(solarAreaModule.solarSurface);
    } catch (err) {
      if (action) {
        action.icon = 'mdi-alert-circle-outline';
      }
      app.notifier.add({
        type: NotificationType.WARNING,
        message: 'solarRevenue.nasa',
      });
      throw err;
    }

    solarAreaModule.calculatedProgress.progress = 0;
    solarAreaModule.calculatedProgress.numberCurrentRays = 0;

    const numberSurfacePoints =
      solarAreaModule.solarSurface.surfacePoints.length;
    const numberSunPoints = solarAreaModule.solarSurface.sunPoints
      ? solarAreaModule.solarSurface.sunPoints.length
      : 0;
    const numberHemispherePoints = solarAreaModule.solarSurface.hemispherePoints
      ? solarAreaModule.solarSurface.hemispherePoints.length
      : 0;
    solarAreaModule.calculatedProgress.numberTotalRays =
      (numberSunPoints + numberHemispherePoints) * numberSurfacePoints;

    await calculateDiffuseIrradiation(
      solarAreaModule.solarSurface,
      app,
      solarAreaModule.calculatedProgress,
      isDebug,
    );
    await calculateDirectIrradiation(
      solarAreaModule.solarSurface,
      app,
      solarAreaModule.calculatedProgress,
      isDebug,
    );
    accumSolarRad(solarAreaModule.solarSurface, solarAreaModule);
    if (action) {
      action.icon = 'mdi-refresh-circle';
    }
    updateSolarProgress(solarAreaModule.calculatedProgress);
  }
}

export async function calculateSolarAreaModules(
  selectedModules: SolarModule[],
  app: VcsUiApp,
  isDebug: boolean,
): Promise<void> {
  for (const solarAreaModule of selectedModules) {
    // eslint-disable-next-line no-await-in-loop
    await calculateSolarAreaModule(solarAreaModule, app, isDebug);
  }
}

export function highlightSelectedAreaModule(
  featureId: number | string | symbol,
  selectedModules: SolarModule[],
  layer: VectorLayer,
): void {
  selectedModules.forEach((solarModule) => {
    layer.featureVisibility.unHighlight([solarModule.featureId]);
  });
  if (featureId !== null) {
    layer.featureVisibility.highlight({
      [featureId]: new VectorStyleItem({
        fill: { color: [0, 0, 0, 0.3] },
        stroke: { color: [255, 255, 255, 1.0], width: 3 },
      }),
    });
  }
}
