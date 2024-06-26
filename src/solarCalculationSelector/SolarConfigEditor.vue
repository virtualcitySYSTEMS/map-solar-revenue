<template>
  <AbstractConfigEditor @submit="apply" v-bind="{ ...$attrs, ...$props }">
    <VcsFormSection heading="admin options" expandable :start-open="true">
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.germanPowerMix') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="germanPowerMix"
              dense
              v-model.number="localConfig.adminOptions.germanPowerMix"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.germanPowerMixYear') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="germanPowerMixYear"
              dense
              v-model.number="localConfig.adminOptions.germanPowerMixYear"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.solarManufacture') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="solarManufacture"
              dense
              v-model.number="localConfig.adminOptions.solarManufacture"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.electricityDemandPerPerson') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemandPerPerson"
              dense
              v-model.number="
                localConfig.adminOptions.electricityDemandPerPerson
              "
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.electricityDemandHeatPump') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemandHeatPump"
              dense
              v-model.number="
                localConfig.adminOptions.electricityDemandHeatPump
              "
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.electricityDemandCar') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemandCar"
              dense
              v-model.number="localConfig.adminOptions.electricityDemandCar"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.storageDegradation') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="storageDegradation"
              dense
              v-model.number="localConfig.adminOptions.storageDegradation"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.storageLosses') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="storageLosses"
              dense
              v-model.number="localConfig.adminOptions.storageLosses"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.amortizationPeriod') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="amortizationPeriod"
              dense
              v-model.number="localConfig.adminOptions.amortizationPeriod"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.admin.maintenancePortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="maintenancePortion"
              dense
              v-model.number="localConfig.adminOptions.maintenancePortion"
            />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
    <VcsFormSection heading="user options" expandable :start-open="true">
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.numberOfPersons') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="numberOfPersons"
              dense
              v-model.number="localConfig.userOptions.numberOfPersons"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.livingSpace') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="livingSpace"
              dense
              v-model.number="localConfig.userOptions.livingSpace"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.annualDrivingDistance') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="annualDrivingDistance"
              dense
              v-model.number="localConfig.userOptions.annualDrivingDistance"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.directConsumptionPortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="directConsumptionPortion"
              dense
              v-model.number="localConfig.userOptions.directConsumptionPortion"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.storageConsumptionPortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="storageConsumptionPortion"
              dense
              v-model.number="localConfig.userOptions.storageConsumptionPortion"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.gridPurchaseCosts') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="gridPurchaseCosts"
              dense
              v-model.number="localConfig.userOptions.gridPurchaseCosts"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.feedInTariff') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="feedInTariff"
              dense
              v-model.number="localConfig.userOptions.feedInTariff"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.electricityPriceIncrease') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityPriceIncrease"
              dense
              v-model.number="localConfig.userOptions.electricityPriceIncrease"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.equityCapital') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="equityCapital"
              dense
              v-model.number="localConfig.userOptions.equityCapital"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.creditPeriod') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="creditPeriod"
              dense
              v-model.number="localConfig.userOptions.creditPeriod"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.creditInterest') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="creditInterest"
              dense
              v-model.number="localConfig.userOptions.creditInterest"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.user.electricityDemand') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemand"
              dense
              v-model.number="localConfig.userOptions.electricityDemand"
            />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
    <VcsFormSection heading="global options" expandable :start-open="true">
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.global.isVcSolar') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox
              id="isVcSolar"
              dense
              v-model="localConfig.globalSettings.isVcSolar"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.global.solarLayerName') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="solarLayerName"
              dense
              v-model="localConfig.globalSettings.solarLayerName"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.global.isDebug') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox
              id="isDebug"
              dense
              v-model="localConfig.globalSettings.isDebug"
            />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
    <VcsFormSection heading="vcSolar options" expandable :start-open="true">
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.vcSolar.efficiency') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="efficiency"
              dense
              v-model="localConfig.vcSolarOptions.efficiency"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.vcSolar.costs') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="costs"
              dense
              v-model="localConfig.vcSolarOptions.costs"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.vcSolar.degradation') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="degradation"
              dense
              v-model="localConfig.vcSolarOptions.degradation"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel dense>
              {{ $t('solarRevenue.config.vcSolar.kwpPerArea') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="kwpPerArea"
              dense
              v-model="localConfig.vcSolarOptions.kwpPerArea"
            />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
  </AbstractConfigEditor>
</template>

<script lang="ts">
  import {
    AbstractConfigEditor,
    VcsCheckbox,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';
  import { defineComponent, PropType, Ref, ref } from 'vue';
  import { VCol, VContainer, VRow } from 'vuetify/lib';
  import getDefaultOptions, { SolarOptions } from '../solarOptions.js';
  import { configWithDefaults } from '../helper.js';

  export default defineComponent({
    name: 'SolarConfigEditor',
    title: 'Solar Editor', // heading displayed on editor window
    components: {
      VcsCheckbox,
      VRow,
      VCol,
      VContainer,
      VcsLabel,
      VcsFormSection,
      AbstractConfigEditor,
      VcsTextField,
    },
    props: {
      getConfig: {
        type: Function as PropType<() => Promise<SolarOptions>>,
        required: true,
      },
      setConfig: {
        type: Function,
        required: true,
      },
    },
    setup(props) {
      const localConfig: Ref<SolarOptions> = ref(getDefaultOptions());
      // all plugins should provide a method returning default options
      const defaultOptions = getDefaultOptions();

      props
        .getConfig()
        .then((config: SolarOptions) => {
          localConfig.value = configWithDefaults(defaultOptions, config);
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.error(err));

      return {
        localConfig,
        async apply(): Promise<void> {
          await props.setConfig(localConfig.value);
        },
      };
    },
  });
</script>
