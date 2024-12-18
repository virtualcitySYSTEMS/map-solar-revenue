import {
  AbstractInteraction,
  CesiumTilesetLayer,
  EventType,
  InteractionEvent,
  VectorLayer,
  VectorStyleItem,
} from '@vcmap/core';
import { Cesium3DTileFeature, ColorBlendMode } from '@vcmap-cesium/engine';
import { NotificationType, VcsUiApp } from '@vcmap/ui';
import { reactive, Ref } from 'vue';
import type { SolarModule } from '../solarInputTypes.js';
import { filterObject } from '../helper.js';
import { VcSolarOptions } from '../solarOptions.js';

export function calculateSolarIrradiation(
  feature: Cesium3DTileFeature,
): number {
  const attributes = feature.getProperty('attributes');
  const solarValues = filterObject(attributes, ([k]) =>
    k.includes('globalRadMonths'),
  );

  const globalRadYear = Object.values(solarValues).reduce<number>(
    (acc: number, cur: number) => acc + cur,
    0,
  );

  return globalRadYear;
}

export function areaToKwp(kwpPerArea: number, area: number): number {
  return kwpPerArea * area;
}

class VcSolarInteraction extends AbstractInteraction {
  _selectedModules: Ref<SolarModule[]>;

  _app: VcsUiApp;

  _localFeatureTrack: (number | symbol | string)[];

  _vcSolarOptions: VcSolarOptions;

  _solarLayerName: string;

  constructor(
    app: VcsUiApp,
    selectedModules: Ref<SolarModule[]>,
    vcSolarOptions: VcSolarOptions,
    solarLayerName: string,
  ) {
    super(EventType.CLICK);
    this._vcSolarOptions = vcSolarOptions;
    this._selectedModules = selectedModules || [];
    this._app = app;
    this._localFeatureTrack = [];
    this._solarLayerName = solarLayerName;
    this.setActive(true);
  }

  _highlightFeature(featureId: number | string | null): void {
    if (featureId !== null) {
      this.solarLayer?.featureVisibility.highlight({
        [featureId]: new VectorStyleItem({
          colorBlendMode: ColorBlendMode.REPLACE,
          fill: { color: [255, 0, 255, 1.0] },
        }),
      });
    }
  }

  highlightSelectedFeature(featureId: number | string | undefined): void {
    this.highlightFeatures();
    if (featureId != null) {
      this.solarLayer?.featureVisibility.highlight({
        [featureId]: new VectorStyleItem({
          colorBlendMode: ColorBlendMode.REPLACE,
          fill: { color: [255, 0, 255, 1] },
        }),
      });
    }
  }

  highlightFeatures(): void {
    this._selectedModules.value.forEach((solarModule) => {
      this._highlightFeature(solarModule.featureId);
    });
  }

  _unHighLightFeatures(): void {
    this._selectedModules.value.forEach((solarModule) => {
      this.solarLayer?.featureVisibility.unHighlight([solarModule.featureId]);
    });
  }

  _removeFeature(feature: Cesium3DTileFeature): void {
    this._selectedModules.value = this._selectedModules.value.filter(
      (solarModule) => {
        return solarModule.featureId !== feature.getId();
      },
    );

    this._localFeatureTrack = this._localFeatureTrack.filter(
      (featureId) => featureId !== feature.featureId,
    );
    this.solarLayer?.featureVisibility.unHighlight([feature.getId()]);
  }

  _selectFeature(feature: Cesium3DTileFeature): void {
    if (this._localFeatureTrack.indexOf(feature.featureId) === -1) {
      const attributes = feature.getProperty('attributes');
      if (attributes.solarArea) {
        const moduleFeature = reactive<SolarModule>({
          type: 'vcsolar',
          featureId: feature.getId(),
          area: attributes.solarArea || -9999,
          efficiency: this._vcSolarOptions.efficiency,
          costs: this._vcSolarOptions.costs,
          kwp: areaToKwp(this._vcSolarOptions.kwpPerArea, attributes.solarArea),
          solarIrradiation: calculateSolarIrradiation(feature) || 0,
          degradation: this._vcSolarOptions.degradation,
          calculatedProgress: {
            numberCurrentRays: 0,
            numberTotalRays: 0,
            progress: 100,
          },
          actions: [
            {
              name: 'removeSolarModule',
              title: 'solarRevenue.solarSelector.remove',
              icon: '$vcsTrashCan',
              callback: (): void => {
                this._removeFeature(feature);
                this.highlightFeatures();
              },
            },
          ],
        }) as SolarModule;
        this._selectedModules.value.push(moduleFeature);
        this._localFeatureTrack.push(feature.featureId);
        this._highlightFeature(feature.getId());
      } else {
        this._app.notifier.add({
          type: NotificationType.INFO,
          message: 'solarRevenue.solarSelector.noVCSolar',
        });
      }
    } else {
      this._removeFeature(feature);
    }
  }

  pipe(event: InteractionEvent): Promise<InteractionEvent> {
    if (event.feature) {
      if (event.feature instanceof Cesium3DTileFeature) {
        this._selectFeature(event.feature);
      }
    }
    return Promise.resolve(event);
  }

  clear(): void {
    this._unHighLightFeatures();
    this._selectedModules.value = [];
    this._localFeatureTrack = [];
    (
      this._app.layers.getByKey('_solarAreaLayer') as VectorLayer
    )?.removeAllFeatures();
  }

  destroy(): void {
    super.destroy();
    this.clear();
  }

  get solarLayer(): CesiumTilesetLayer | undefined {
    return this._app.layers.getByKey(
      this._solarLayerName,
    ) as CesiumTilesetLayer;
  }
}

export default VcSolarInteraction;
