import { PluginConfigEditor, VcsAction, VcsPlugin, VcsUiApp } from '@vcmap/ui';
import { Component, ref, Ref } from 'vue';
import { name, version, mapVersion } from '../package.json';
import de from './i18n/de.json';
import en from './i18n/en.json';

import type { SolarOptions } from './solarOptions.js';
import { deepDiff, deepMerge } from './helper.js';
import type { DeepPartial } from './helper.js';
import createSolarNavbar, {
  createSolarAreaToolbox,
  createVcSolarToolBox,
  solarSelectorId,
} from './solarCalculationSelector/solarSelector.js';
import type { SolarModule } from './solarInputTypes.js';
import VcSolarInteraction from './solarCalculationSelector/vcSolarInteraction.js';
import SolarConfigEditor from './solarCalculationSelector/SolarConfigEditor.vue';
import getDefaultOptions from './solarOptions.js';

export type SolarPlugin = VcsPlugin<DeepPartial<SolarOptions>, never> & {
  readonly config: SolarOptions;
  selectedModules: Ref<SolarModule[]>;
  vcSolarInteraction: VcSolarInteraction;
  solarAreaAction: VcsAction;
  vcSolarAction: VcsAction;
  selectedSolarModule: Ref<SolarModule | null>;
};

export default function solarRevenuePlugin(
  configInput: DeepPartial<SolarOptions>,
): SolarPlugin {
  let app: VcsUiApp;
  let selectedModules: Ref<SolarModule[]>;
  let vcSolarInteraction: VcSolarInteraction;
  let solarAreaAction: VcsAction;
  let vcSolarAction: VcsAction;
  const destroyFunctions: (() => void)[] = [];
  const config = deepMerge(getDefaultOptions(), configInput) as SolarOptions;
  let selectedSolarModule: Ref<SolarModule | null>;

  return {
    get name(): string {
      return name;
    },
    get version(): string {
      return version;
    },
    get mapVersion(): string {
      return mapVersion;
    },
    get config(): SolarOptions {
      return config;
    },
    get selectedModules(): Ref<SolarModule[]> {
      return selectedModules;
    },
    get selectedSolarModule(): Ref<SolarModule | null> {
      return selectedSolarModule;
    },
    get vcSolarInteraction(): VcSolarInteraction {
      return vcSolarInteraction;
    },
    get solarAreaAction(): VcsAction {
      return solarAreaAction;
    },
    get vcSolarAction(): VcsAction {
      return vcSolarAction;
    },
    initialize(vcsUiApp: VcsUiApp): void {
      const solarRevenueId = 'solar-revenue';
      app = vcsUiApp;
      selectedModules = ref([]);
      selectedSolarModule = ref(null);
      vcSolarInteraction = new VcSolarInteraction(
        app,
        selectedModules,
        this.config.vcSolarOptions,
        this.config.globalSettings.solarLayerName,
      );

      const removedListener = app.windowManager.removed.addEventListener(
        ({ id }) => {
          if (id === solarSelectorId) {
            app?.toolboxManager.remove('solarArea');
            app?.toolboxManager.remove('vcSolar');
            app?.windowManager.remove(solarRevenueId);
            app?.maps.eventHandler.removeExclusive();
          }
        },
      );

      const toolboxAddedListener = app.windowManager.added.addEventListener(
        ({ id }) => {
          if (id === solarSelectorId) {
            if (this.config.globalSettings.isVcSolar) {
              const { removeSolarInteraction, action: vcSolarActionInit } =
                createVcSolarToolBox(app, vcSolarInteraction);
              vcSolarAction = vcSolarActionInit;
              destroyFunctions.push(removeSolarInteraction);
            }

            const { removeSolarAreaToolbox, action: solarAreaActionInit } =
              createSolarAreaToolbox(
                app,
                selectedModules,
                this.config.vcSolarOptions,
                this.config.globalSettings.isDebug,
              );
            solarAreaAction = solarAreaActionInit;
            destroyFunctions.push(removeSolarAreaToolbox);
          }
        },
      );

      const vcSolarInteractionListener = createSolarNavbar(
        app,
        config.globalSettings.infoContent,
      );

      destroyFunctions.push(removedListener);
      destroyFunctions.push(vcSolarInteractionListener);
      destroyFunctions.push(toolboxAddedListener);
    },
    getDefaultOptions,
    toJSON(): DeepPartial<SolarOptions> {
      return deepDiff(getDefaultOptions(), config);
    },

    getConfigEditors(): PluginConfigEditor<object>[] {
      return [
        {
          component: SolarConfigEditor as Component,
          title: 'solarRevenue.editorTitle',
          infoUrlCallback: app.getHelpUrlCallback(
            '/components/plugins/solarToolConfig.html',
            'app-configurator',
          ),
        },
      ];
    },

    destroy(): void {
      const solarLayer = app.layers.getByKey('_solarAreaLayer');
      if (solarLayer) {
        app.layers.remove(solarLayer);
      }
      vcSolarInteraction?.clear();
      destroyFunctions.forEach((cb) => cb());
    },
    i18n: {
      de,
      en,
    },
  };
}
