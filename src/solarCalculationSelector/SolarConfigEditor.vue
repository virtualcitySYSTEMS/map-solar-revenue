<template>
  <AbstractConfigEditor @submit="apply" v-bind="{ ...$attrs, ...$props }">
    <VcsFormSection
      heading="solarRevenue.config.adminSectionTitle"
      expandable
      :start-open="true"
    >
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.germanPowerMix') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.germanPowerMix"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.germanPowerMixYear') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.germanPowerMixYear"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.solarManufacture') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.solarManufacture"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.electricityDemandPerPerson') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="
                localConfig.adminOptions.electricityDemandPerPerson
              "
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.electricityDemandHeatPump') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="
                localConfig.adminOptions.electricityDemandHeatPump
              "
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.electricityDemandCar') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.electricityDemandCar"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.storageDegradation') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.storageDegradation"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.storageLosses') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.storageLosses"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.amortizationPeriod') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.amortizationPeriod"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.maintenancePortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.maintenancePortion"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.helpPriceIncreaseStart') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.helpPriceIncreaseStart"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.helpPriceIncreaseEnd') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.adminOptions.helpPriceIncreaseEnd"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.admin.helpPriceIncreasePercentage') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="
                localConfig.adminOptions.helpPriceIncreasePercentage
              "
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
    <VcsFormSection
      heading="solarRevenue.config.userSectionTitle"
      expandable
      :start-open="true"
    >
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.numberOfPersons') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.numberOfPersons"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.livingSpace') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.livingSpace"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.annualDrivingDistance') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.annualDrivingDistance"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.directConsumptionPortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.directConsumptionPortion"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.storageConsumptionPortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.storageConsumptionPortion"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.gridPurchaseCosts') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.gridPurchaseCosts"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.feedInTariff') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.feedInTariff"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.electricityPriceIncrease') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.electricityPriceIncrease"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.equityCapital') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.equityCapital"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.creditPeriod') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.creditPeriod"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.creditInterest') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.creditInterest"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.user.electricityDemand') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model.number="localConfig.userOptions.electricityDemand"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
    <SolarConsumptionProfile
      heading="my Heading"
      v-model="localConfig.adminOptions.consumptionProfiles"
    />
    <VcsFormSection
      heading="solarRevenue.config.globalSectionTitle"
      expandable
      :start-open="true"
    >
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.global.isVcSolar') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox v-model="localConfig.globalSettings.isVcSolar" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.global.solarLayerName') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField v-model="localConfig.globalSettings.solarLayerName" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.global.isDebug') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox v-model="localConfig.globalSettings.isDebug" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.global.isPaginated') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox v-model="localConfig.globalSettings.isPaginated" />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.global.itemsPerPage') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model="localConfig.globalSettings.itemsPerPage"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.global.infoContent') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField v-model="localConfig.globalSettings.infoContent" />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
    <VcsFormSection
      heading="solarRevenue.config.vcSolarSectionTitle"
      expandable
      :start-open="true"
    >
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.vcSolar.efficiency') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model="localConfig.vcSolarOptions.efficiency"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.vcSolar.costs') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model="localConfig.vcSolarOptions.costs"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.vcSolar.degradation') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model="localConfig.vcSolarOptions.degradation"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $st('solarRevenue.config.vcSolar.kwpPerArea') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              v-model="localConfig.vcSolarOptions.kwpPerArea"
              type="number"
              hide-spin-buttons
            />
          </v-col>
        </v-row>
      </v-container>
    </VcsFormSection>
    <SolarDiagramColors
      name-space="solarRevenue.config.colors.global"
      v-model="localConfig.colors.global"
    />
    <SolarDiagramColors
      name-space="solarRevenue.config.colors.revenue"
      v-model="localConfig.colors.revenue"
    />
    <SolarDiagramColors
      name-space="solarRevenue.config.colors.liquidity"
      v-model="localConfig.colors.liquidity"
    />
    <SolarDiagramColors
      name-space="solarRevenue.config.colors.co2"
      v-model="localConfig.colors.co2"
    />
    <v-divider class="mt-2" />
  </AbstractConfigEditor>
</template>

<script setup lang="ts">
  import {
    AbstractConfigEditor,
    VcsCheckbox,
    VcsFormSection,
    VcsLabel,
    VcsTextField,
  } from '@vcmap/ui';
  import { PropType, Ref, ref, toRaw } from 'vue';
  import { VCol, VContainer, VRow, VDivider } from 'vuetify/components';
  import defaultOptions, { SolarOptions } from '../solarOptions.js';
  import { deepMerge } from '../helper.js';
  import SolarDiagramColors from './SolarDiagramColors.vue';
  import SolarConsumptionProfile from './SolarConsumptionProfile.vue';

  const props = defineProps({
    getConfig: {
      type: Function as PropType<() => SolarOptions>,
      required: true,
    },
    setConfig: {
      type: Function,
      required: true,
    },
  });

  const localConfig: Ref<SolarOptions> = ref(
    deepMerge(defaultOptions(), props.getConfig()),
  );

  const apply = (): void => {
    props.setConfig(structuredClone(toRaw(localConfig.value)));
  };
</script>
