import { Cartesian3, Ray } from '@vcmap-cesium/engine';
import { VcsUiApp } from '@vcmap/ui';
import { CesiumMap, mercatorToCartesian } from '@vcmap/core';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Stroke, Style } from 'ol/style';
import direction from './helper.js';

export default abstract class SolarRay {
  _fromPoint: Cartesian3;

  _toPoint: Cartesian3;

  _direction: Cartesian3;

  _app: VcsUiApp;

  _isNotIntersected = false;

  _ray: Ray;

  constructor(fromPoint: Cartesian3, toPoint: Cartesian3, app: VcsUiApp) {
    this._fromPoint = fromPoint;
    this._toPoint = toPoint;
    this._app = app;
    this._direction = direction(
      mercatorToCartesian([
        this._fromPoint.x,
        this._fromPoint.y,
        this._fromPoint.z,
      ]),
      mercatorToCartesian([this._toPoint.x, this._toPoint.y, this._toPoint.z]),
    );
    this._ray = new Ray(
      mercatorToCartesian([
        this._fromPoint.x,
        this._fromPoint.y,
        this._fromPoint.z,
      ]),
      this._direction,
    );
  }

  intersect(): void {
    if (this._app.maps.activeMap instanceof CesiumMap) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-call
      const result = (this._app.maps.activeMap as any)
        .getScene()
        ?.pickFromRay(this._ray, []);
      if (result) {
        this._isNotIntersected = true;
      }
    }
  }

  createRayFeature(): Feature<LineString> {
    const rayFeature = new Feature({
      geometry: new LineString([
        [this._fromPoint.x, this._fromPoint.y, this._fromPoint.z],
        [this._toPoint.x, this._toPoint.y, this._toPoint.z],
      ]),
    });
    let lineStyle: Style = new Style({
      stroke: new Stroke({ color: '#00FF00', width: 1 }),
    });
    if (this._isNotIntersected) {
      lineStyle = new Style({
        stroke: new Stroke({ color: '#FF0000', width: 1 }),
      });
    }
    rayFeature.setStyle(lineStyle);
    return rayFeature;
  }

  get direction(): Cartesian3 {
    return this._direction;
  }

  get isNotIntersected(): boolean {
    return !this._isNotIntersected;
  }
}
