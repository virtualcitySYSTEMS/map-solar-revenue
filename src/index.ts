import { PluginConfigEditor, VcsPlugin, VcsUiApp } from '@vcmap/ui';
import { Component, ref, Ref } from 'vue';
import { name, version, mapVersion } from '../package.json';
import de from './i18n/de.json';
import en from './i18n/en.json';

import getDefaultOptions from './solarOptions.js';
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

export type SolarPlugin = VcsPlugin<DeepPartial<SolarOptions>, never> & {
  readonly config: SolarOptions;
  selectedModules: Ref<SolarModule[]>;
  vcSolarInteraction: VcSolarInteraction;
};

export default function solarRevenuePlugin(
  configInput: DeepPartial<SolarOptions>,
): SolarPlugin {
  let app: VcsUiApp;
  let selectedModules: Ref<SolarModule[]>;
  let vcSolarInteraction: VcSolarInteraction;
  const destroyFunctions: (() => void)[] = [];
  const config = deepMerge(getDefaultOptions(), configInput) as SolarOptions;

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
    get vcSolarInteraction(): VcSolarInteraction {
      return vcSolarInteraction;
    },
    initialize(vcsUiApp: VcsUiApp): void {
      const solarRevenueId = 'solar-revenue';
      app = vcsUiApp;
      selectedModules = ref([]);
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
          }
        },
      );

      const toolboxAddedListener = app.windowManager.added.addEventListener(
        ({ id }) => {
          if (id === solarSelectorId) {
            if (this.config.globalSettings.isVcSolar) {
              const vcSolarToolboxListener = createVcSolarToolBox(
                app,
                vcSolarInteraction,
              );
              destroyFunctions.push(vcSolarToolboxListener);
            }

            const removeSolarAreaToolbox = createSolarAreaToolbox(
              app,
              selectedModules,
              this.config.vcSolarOptions,
              this.config.globalSettings.isDebug,
            );
            destroyFunctions.push(removeSolarAreaToolbox);
          }
        },
      );

      const vcSolarInteractionListener = createSolarNavbar(app);

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
          infoUrlCallback: app.getHelpUrlCallback(
            '/components/plugins/solarToolConfig.html',
          ),
        },
      ];
    },

    destroy(): void {
      destroyFunctions.forEach((cb) => cb());
    },
    i18n: {
      de,
      en,
    },
  };
}
