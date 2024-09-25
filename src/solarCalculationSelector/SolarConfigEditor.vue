<template>
  <AbstractConfigEditor @submit="apply" v-bind="{ ...$attrs, ...$props }">
    <VcsFormSection heading="admin options" expandable :start-open="true">
      <v-container class="py-0 px-1">
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.germanPowerMix') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="germanPowerMix"
              v-model.number="localConfig.adminOptions.germanPowerMix"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.germanPowerMixYear') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="germanPowerMixYear"
              v-model.number="localConfig.adminOptions.germanPowerMixYear"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.solarManufacture') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="solarManufacture"
              v-model.number="localConfig.adminOptions.solarManufacture"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.electricityDemandPerPerson') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemandPerPerson"
              v-model.number="
                localConfig.adminOptions.electricityDemandPerPerson
              "
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.electricityDemandHeatPump') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemandHeatPump"
              v-model.number="
                localConfig.adminOptions.electricityDemandHeatPump
              "
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.electricityDemandCar') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemandCar"
              v-model.number="localConfig.adminOptions.electricityDemandCar"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.storageDegradation') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="storageDegradation"
              v-model.number="localConfig.adminOptions.storageDegradation"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.storageLosses') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="storageLosses"
              v-model.number="localConfig.adminOptions.storageLosses"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.amortizationPeriod') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="amortizationPeriod"
              v-model.number="localConfig.adminOptions.amortizationPeriod"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.admin.maintenancePortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="maintenancePortion"
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
            <VcsLabel>
              {{ $t('solarRevenue.config.user.numberOfPersons') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="numberOfPersons"
              v-model.number="localConfig.userOptions.numberOfPersons"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.livingSpace') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="livingSpace"
              v-model.number="localConfig.userOptions.livingSpace"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.annualDrivingDistance') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="annualDrivingDistance"
              v-model.number="localConfig.userOptions.annualDrivingDistance"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.directConsumptionPortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="directConsumptionPortion"
              v-model.number="localConfig.userOptions.directConsumptionPortion"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.storageConsumptionPortion') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="storageConsumptionPortion"
              v-model.number="localConfig.userOptions.storageConsumptionPortion"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.gridPurchaseCosts') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="gridPurchaseCosts"
              v-model.number="localConfig.userOptions.gridPurchaseCosts"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.feedInTariff') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="feedInTariff"
              v-model.number="localConfig.userOptions.feedInTariff"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.electricityPriceIncrease') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityPriceIncrease"
              v-model.number="localConfig.userOptions.electricityPriceIncrease"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.equityCapital') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="equityCapital"
              v-model.number="localConfig.userOptions.equityCapital"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.creditPeriod') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="creditPeriod"
              v-model.number="localConfig.userOptions.creditPeriod"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.creditInterest') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="creditInterest"
              v-model.number="localConfig.userOptions.creditInterest"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.user.electricityDemand') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="electricityDemand"
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
            <VcsLabel>
              {{ $t('solarRevenue.config.global.isVcSolar') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox
              id="isVcSolar"
              v-model="localConfig.globalSettings.isVcSolar"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.global.solarLayerName') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="solarLayerName"
              v-model="localConfig.globalSettings.solarLayerName"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.global.isDebug') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsCheckbox
              id="isDebug"
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
            <VcsLabel>
              {{ $t('solarRevenue.config.vcSolar.efficiency') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="efficiency"
              v-model="localConfig.vcSolarOptions.efficiency"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.vcSolar.costs') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="costs"
              v-model="localConfig.vcSolarOptions.costs"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.vcSolar.degradation') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="degradation"
              v-model="localConfig.vcSolarOptions.degradation"
            />
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col>
            <VcsLabel>
              {{ $t('solarRevenue.config.vcSolar.kwpPerArea') }}
            </VcsLabel>
          </v-col>
          <v-col>
            <VcsTextField
              id="kwpPerArea"
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
  import { VCol, VContainer, VRow } from 'vuetify/components';
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
        type: Function as PropType<() => SolarOptions>,
        required: true,
      },
      setConfig: {
        type: Function,
        required: true,
      },
    },
    setup(props) {
      const localConfig: Ref<SolarOptions> = ref(
        configWithDefaults(getDefaultOptions(), props.getConfig()),
      );

      return {
        localConfig,
        apply(): void {
          props.setConfig(localConfig.value);
        },
      };
    },
  });
</script>
