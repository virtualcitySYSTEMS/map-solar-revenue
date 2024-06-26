import {
  ButtonLocation,
  createToggleAction,
  ToolboxType,
  VcsAction,
  VcsUiApp,
  WindowSlot,
} from '@vcmap/ui';
import {
  CesiumMap,
  CreateFeatureSession,
  GeometryType,
  markVolatile,
  maxZIndex,
  mercatorProjection,
  startCreateFeatureSession,
  VectorLayer,
} from '@vcmap/core';
import { Ref } from 'vue';
import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import SolarSelector from './SolarSelector.vue';
import { name } from '../../package.json';
import VcSolarInteraction, { areaToKwp } from './vcSolarInteraction.js';
import {
  calculateSolarAreaModule,
  createSolarSurface,
} from '../revenueCalculator/areaSelector/areaSelector.js';
import { SolarModule } from '../solarInputTypes.js';
import { VcSolarOptions } from '../solarOptions.js';

export const solarSelectorId = 'solar-selector';

export type SolarCalculationType = 'vcsolar' | 'area' | 'module';

export default function createSolarNavbar(vcsUiApp: VcsUiApp): () => void {
  const { action } = createToggleAction(
    {
      name: 'solarRevenue.name',
      icon: 'mdi-solar-power',
      title: 'solarRevenue.tooltip',
    },
    {
      id: solarSelectorId,
      component: SolarSelector,
      slot: WindowSlot.DYNAMIC_LEFT,
      state: {
        headerTitle: 'solarRevenue.name',
      },
      position: {
        width: '430px',
        height: '800px',
      },
    },
    vcsUiApp.windowManager,
    name,
  );

  vcsUiApp.navbarManager.add(
    {
      id: 'solarID',
      action,
    },
    name,
    ButtonLocation.TOOL,
  );

  const mapChangedListener = vcsUiApp.maps.mapActivated.addEventListener(
    (map) => {
      if (!(map instanceof CesiumMap)) {
        if (vcsUiApp.windowManager.has(solarSelectorId)) {
          vcsUiApp.windowManager.remove(solarSelectorId);
        }
        action.disabled = true;
      } else {
        action.disabled = false;
      }
    },
  );
  return mapChangedListener;
}

export function createSolarAreaToolbox(
  app: VcsUiApp,
  selectedModules: Ref<SolarModule[]>,
  vcSolarOptions: VcSolarOptions,
  isDebug: boolean,
): () => void {
  let currentFeatureId: string | number | undefined;
  let areaId = 1;
  let session: CreateFeatureSession<GeometryType.Polygon>;

  const layer = app.layers.getByKey('_solarAreaLayer')
    ? (app.layers.getByKey('_solarAreaLayer') as VectorLayer)
    : new VectorLayer({
        name: '_solarAreaLayer',
        projection: mercatorProjection.toJSON(),
        zIndex: maxZIndex - 1,
        vectorProperties: {
          altitudeMode: 'absolute',
        },
      });

  app.layers.add(layer);
  markVolatile(layer);

  const escapeListener = (event: KeyboardEvent): void => {
    if (event.code === 'Escape') {
      if (layer.getFeatures()) {
        if (currentFeatureId !== undefined) {
          session.finish();
          layer.removeFeaturesById([currentFeatureId]);
          selectedModules.value = selectedModules.value.filter(
            (selectedModule) => selectedModule.id !== currentFeatureId,
          );
        }
      }
    }
  };

  const currentFeatureIdListener = (currentFeature: Feature<Polygon>): void => {
    currentFeatureId = currentFeature.getId();
  };

  const solarAreaAction: VcsAction = {
    name: 'areaAction',
    title: 'solarRevenue.solarSelector.drawArea',
    icon: 'mdi-view-grid-plus-outline',
    active: false,
    async callback(): Promise<void> {
      if (this.active) {
        session.stop();
        window.removeEventListener('keydown', escapeListener);
        app.maps.eventHandler.featureInteraction.pullPickedPosition = 0.0;
        this.active = false;
      } else {
        if (layer instanceof VectorLayer) {
          await layer.activate();
          window.addEventListener('keydown', escapeListener);
          app.maps.eventHandler.featureInteraction.pullPickedPosition = 0.05;
          session = startCreateFeatureSession(app, layer, GeometryType.Polygon);
          session.featureCreated.addEventListener(currentFeatureIdListener);
          session.stopped.addEventListener(() => {
            this.active = false;
          });

          session.creationFinished.addEventListener((feature) => {
            if (feature) {
              const solarSurface = createSolarSurface(feature, app);
              const moduleFeature: SolarModule = {
                id: feature.getId() || 0,
                featureId: areaId,
                area: solarSurface.solarArea,
                efficiency: vcSolarOptions.efficiency,
                costs: vcSolarOptions.costs,
                kwp: areaToKwp(
                  vcSolarOptions.kwpPerArea,
                  solarSurface.solarArea,
                ),
                solarIrradiation: solarSurface.globalRad,
                degradation: vcSolarOptions.degradation,
                solarSurface,
                calculatedProgress: {
                  numberTotalRays: 0,
                  numberCurrentRays: 0,
                  progress: 0,
                },
                actions: [
                  {
                    name: 'removeSolarModule',
                    title: 'solarRevenue.solarSelector.remove',
                    icon: '$vcsTrashCan',
                    callback: (): void => {
                      if (feature.getId()) {
                        layer.removeFeaturesById([
                          feature.getId() as string | number,
                        ]);
                      }
                      selectedModules.value = selectedModules.value.filter(
                        (x) => {
                          return x.id !== feature.getId();
                        },
                      );
                    },
                  },
                  {
                    name: 'calculateSolarModule',
                    icon: 'mdi-refresh-circle',
                    title: 'solarRevenue.solarSelector.recalculate',
                    async callback(): Promise<void> {
                      this.icon = '$vcsProgress';
                      await calculateSolarAreaModule(
                        moduleFeature,
                        app,
                        isDebug,
                      );
                      this.icon = 'mdi-refresh-circle';
                    },
                  },
                ],
              };
              selectedModules.value.push(moduleFeature);
              areaId += 1;
            }
          });
        }
        this.active = true;
      }
    },
  };

  app.toolboxManager.add(
    {
      id: 'solarArea',
      type: ToolboxType.SINGLE,
      action: solarAreaAction,
    },
    name,
  );
  const destroy = (): void => {
    session.stop();
    app.layers.remove(layer);
    window.removeEventListener('keydown', escapeListener);
  };
  return destroy;
}

export function createVcSolarToolBox(
  app: VcsUiApp,
  solarInteraction: VcSolarInteraction,
): () => void {
  let removeSolarInteraction: () => void = () => {};
  const { eventHandler } = app.maps;

  const vcSolarAction: VcsAction = {
    name: 'vcSolarAction',
    title: 'solarRevenue.solarSelector.selectArea',
    icon: 'mdi-home-roof',
    active: false,
    async callback(): Promise<void> {
      if (this.active) {
        removeSolarInteraction();
        this.active = false;
      } else {
        app.featureInfo.clear();
        solarInteraction.setActive(true);
        solarInteraction.highlightFeatures();
        removeSolarInteraction = eventHandler.addExclusiveInteraction(
          solarInteraction,
          () => {
            this.active = false;
          },
        );
        this.active = true;

        if (solarInteraction.solarLayer) {
          await solarInteraction.solarLayer.activate();
        }
      }
    },
  };

  app.toolboxManager.add(
    {
      id: 'vcSolar',
      type: ToolboxType.SINGLE,
      action: vcSolarAction,
    },
    name,
  );

  const destroy = (): void => {
    removeSolarInteraction();
  };
  return destroy;
}
