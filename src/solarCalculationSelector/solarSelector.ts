import {
  ButtonLocation,
  createToggleAction,
  ToolboxType,
  VcsAction,
  VcsTextPage,
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
  mercatorToCartesian,
  startCreateFeatureSession,
  VectorLayer,
} from '@vcmap/core';
import { reactive, Ref } from 'vue';
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
import { calculateBoundingSphere } from '../helper.js';

export const solarSelectorId = 'solar-selector';
export const solarInfoActionId = 'solar-info-action-id';

export default function createSolarNavbar(
  vcsUiApp: VcsUiApp,
  infoContent: string,
): { removeSolarNavbar: () => void; infoAction: VcsAction; action: VcsAction } {
  const infoAction = createToggleAction(
    {
      name: 'solar-revenue-info-action',
      icon: 'mdi-information',
    },
    {
      id: solarInfoActionId,
      component: VcsTextPage,
      slot: WindowSlot.DYNAMIC_RIGHT,
      state: {
        headerTitle: 'solarRevenue.infoContent.headerTitle',
      },
      position: {
        width: '600px',
        height: '800px',
      },
      props: {
        content: infoContent,
      },
    },
    vcsUiApp.windowManager,
    name,
  );

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
        headerIcon: 'mdi-solar-power',
        headerActions: [infoAction.action],
      },
      position: {
        width: '430px',
        height: 'auto',
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

  const removeSolarNavbar = vcsUiApp.maps.mapActivated.addEventListener(
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
  return { removeSolarNavbar, infoAction: infoAction.action, action };
}

export function createSolarAreaToolbox(
  app: VcsUiApp,
  selectedModules: Ref<SolarModule[]>,
  vcSolarOptions: VcSolarOptions,
  isDebug: boolean,
): { removeSolarAreaToolbox: () => void; action: VcsAction } {
  let currentFeatureId: string | number | undefined;
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
            (selectedModule) => selectedModule.featureId !== currentFeatureId,
          );
        }
      }
    }
  };

  const currentFeatureIdListener = (currentFeature: Feature<Polygon>): void => {
    currentFeatureId = currentFeature.getId();
  };

  const action: VcsAction = reactive({
    name: 'areaAction',
    title: 'solarRevenue.solarSelector.drawArea',
    icon: 'mdi-view-grid-plus-outline',
    active: false,
    async callback(): Promise<void> {
      if (action.active) {
        session.stop();
        window.removeEventListener('keydown', escapeListener);
        app.maps.eventHandler.featureInteraction.pullPickedPosition = 0.0;
        action.active = false;
      } else {
        await layer.activate();
        window.addEventListener('keydown', escapeListener);
        app.maps.eventHandler.featureInteraction.pullPickedPosition = 0.05;
        session = startCreateFeatureSession(app, layer, GeometryType.Polygon);
        session.featureCreated.addEventListener(currentFeatureIdListener);
        session.stopped.addEventListener(() => {
          action.active = false;
        });
        session.creationFinished.addEventListener((feature) => {
          if (feature && app.maps.activeMap instanceof CesiumMap) {
            const camera = app.maps.activeMap.getScene()?.camera;
            const solarSurface = createSolarSurface(feature, app);
            const moduleFeature = reactive<SolarModule>({
              featureId: feature.getId() || 0,
              area: solarSurface.solarArea,
              efficiency: vcSolarOptions.efficiency,
              costs: vcSolarOptions.costs,
              kwp: areaToKwp(vcSolarOptions.kwpPerArea, solarSurface.solarArea),
              solarIrradiation: solarSurface.globalRad,
              degradation: vcSolarOptions.degradation,
              solarSurface,
              calculatedProgress: {
                numberTotalRays: 0,
                numberCurrentRays: 0,
                progress: 0,
              },
              actions: [],
              type: 'area',
            }) as SolarModule;

            const flatCoordinates = feature.getGeometry()?.getFlatCoordinates();
            if (camera && flatCoordinates) {
              const boundingSphere = calculateBoundingSphere(flatCoordinates);
              moduleFeature.screenshotInfo = {
                position: mercatorToCartesian(boundingSphere.center),
                heading: camera.heading,
                pitch: camera.pitch,
                distance: boundingSphere.radius,
              };
            }

            const removeModuleAction = {
              name: 'removeSolarModule',
              title: 'solarRevenue.solarSelector.remove',
              icon: '$vcsTrashCan',
              callback: (): void => {
                if (feature.getId()) {
                  layer.removeFeaturesById([
                    feature.getId() as string | number,
                  ]);
                }
                selectedModules.value = selectedModules.value.filter((x) => {
                  return x.featureId !== feature.getId();
                });
              },
            };
            const calculateModuleAction = reactive<VcsAction>({
              name: 'calculateSolarModule',
              icon: 'mdi-refresh-circle',
              title: 'solarRevenue.solarSelector.recalculate',
              async callback(): Promise<void> {
                calculateModuleAction.icon = '$vcsProgress';
                await calculateSolarAreaModule(moduleFeature, app, isDebug);
                calculateModuleAction.icon = 'mdi-refresh-circle';
              },
            });
            moduleFeature.actions?.push(
              removeModuleAction,
              calculateModuleAction,
            );
            selectedModules.value.push(moduleFeature);
          }
        });
        this.active = true;
      }
    },
  });

  app.toolboxManager.add(
    {
      id: 'solarArea',
      type: ToolboxType.SINGLE,
      action,
    },
    name,
  );
  const removeSolarAreaToolbox = (): void => {
    session?.stop();
    app.layers.remove(layer);
    window.removeEventListener('keydown', escapeListener);
  };
  return {
    removeSolarAreaToolbox,
    action,
  };
}

export function createVcSolarToolBox(
  app: VcsUiApp,
  solarInteraction: VcSolarInteraction,
): { removeSolarInteraction: () => void; action: VcsAction } {
  let removeSolarInteraction: () => void = () => {};
  const { eventHandler } = app.maps;

  const action: VcsAction = reactive({
    name: 'vcSolarAction',
    title: 'solarRevenue.solarSelector.selectArea',
    icon: 'mdi-home-roof',
    active: false,
    async callback(): Promise<void> {
      if (this.active) {
        removeSolarInteraction();
        this.active = false;
      } else {
        app.featureInfo.clearSelection();
        solarInteraction.setActive(true);
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
  });

  app.toolboxManager.add(
    {
      id: 'vcSolar',
      type: ToolboxType.SINGLE,
      action,
    },
    name,
  );

  return {
    removeSolarInteraction,
    action,
  };
}
