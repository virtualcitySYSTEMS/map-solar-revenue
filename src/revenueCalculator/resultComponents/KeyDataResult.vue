<template>
  <v-dialog v-model="dialog" width="1100px">
    <template #activator="{ props }">
      <VcsButton
        icon="mdi-open-in-new"
        v-bind="props"
        :disabled="!hasSelectedModules"
      />
    </template>
    <v-card>
      <v-container class="px-5 py-1">
        <h3 class="d-flex align-center px-0 py-3">
          <v-icon class="mr-1 text-primary" size="16"
            >mdi-file-chart-outline</v-icon
          >
          <span
            class="d-inline-block user-select-none font-weight-bold text-primary"
          >
            {{ $st('solarRevenue.keydata.title') }}
          </span>
        </h3>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card
              class="my-1 elevation-0 rounded-0 borderCard justify-center d-flex pa-1"
              outlined
              width="700px"
            >
              {{ $st('solarRevenue.keydata.description') }}
            </v-card>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-1 d-flex justify-center">
          <v-col cols="3">
            <VcsLabel class="font-weight-bold">{{
              $st('solarRevenue.keydata.typeLabel')
            }}</VcsLabel>
          </v-col>
          <v-col cols="5">
            <VcsSelect
              id="chartTypeEnergy"
              :items="chartTypes"
              item-title="title"
              item-value="key"
              v-model="selectedChartType"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-3">
          <v-col class="d-flex justify-center">
            <vcs-data-table
              v-if="selectedChartType === 'environmentalBalance'"
              :items="localEnvironmentalBalance"
              item-key="year"
              :show-select="false"
              :single-select="false"
              :show-searchbar="false"
              :headers="environmentalBalanceHeaders"
              v-model="localEnvironmentalBalance"
              density="compact"
              :items-per-page="itemsPerPage"
            >
              <template
                v-for="(header, index) in environmentalBalanceHeaders"
                :key="index"
                #[`header.${header.key}`]
              >
                <span>
                  {{ $st(header.title) }}
                  <v-tooltip
                    location="bottom"
                    v-if="header.toolTip !== undefined"
                    activator="parent"
                    :text="$st(header.toolTip)"
                    max-width="300"
                  />
                </span>
              </template>
              <template #item="{ item }">
                <tr>
                  <td>{{ item.year }}</td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.coTwoSavings"
                      unit="kg"
                      :fraction-digits="0"
                    />
                  </td>
                </tr>
              </template>
              <template #body.append>
                <tr class="font-weight-bold text--primary">
                  <td>
                    {{ keyDataTotalText }}
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...coTwoSavings.values()])"
                      unit="kg"
                      :fraction-digits="0"
                    />
                  </td>
                </tr>
              </template>
            </vcs-data-table>
            <vcs-data-table
              v-if="selectedChartType === 'energy'"
              class="elevation-0"
              :items="localEnergyBalance"
              item-key="year"
              :show-select="false"
              :single-select="false"
              :show-searchbar="false"
              :headers="energyHeaders"
              v-model="localEnergyBalance"
              density="compact"
              :items-per-page="itemsPerPage"
            >
              <template
                v-for="(header, index) in energyHeaders"
                :key="index"
                #[`header.${header.key}`]
              >
                <span>
                  {{ $st(header.title) }}
                  <v-tooltip
                    location="bottom"
                    v-if="header.toolTip !== undefined"
                    activator="parent"
                    :text="$st(header.toolTip)"
                    max-width="300"
                  />
                </span>
              </template>
              <template #item="{ item }">
                <tr>
                  <td>{{ item.year }}</td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.solarPowerYield"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.electricityDemand"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.storageLosses"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.directConsumption"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.storageConsumption"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.gridConsumption"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.gridSupply"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                </tr>
              </template>
              <template #body.append>
                <tr class="font-weight-bold text--primary">
                  <td>
                    {{ keyDataTotalText }}
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...solarPowerYield.values()])"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...electricityDemand.values()])"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...storageLosses.values()])"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...directConsumption.values()])"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...storageConsumption.values()])"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...gridConsumption.values()])"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...gridSupply.values()])"
                      unit="kWh"
                      :fraction-digits="0"
                    />
                  </td>
                </tr>
              </template>
            </vcs-data-table>
            <vcs-data-table
              v-if="selectedChartType === 'energyCosts'"
              class="elevation-0"
              :items="localEnergyPriceBalance"
              item-key="year"
              :show-select="false"
              :single-select="false"
              :show-searchbar="false"
              :headers="energyPriceHeaders"
              v-model="localEnergyPriceBalance"
              density="compact"
              :items-per-page="itemsPerPage"
            >
              <template
                v-for="(header, index) in energyPriceHeaders"
                :key="index"
                #[`header.${header.key}`]
              >
                <span>
                  {{ $st(header.title) }}
                  <v-tooltip
                    location="bottom"
                    v-if="header.toolTip !== undefined"
                    activator="parent"
                    :text="
                      $st(header.toolTip, {
                        maintenancePortion: maintenancePortion,
                      })
                    "
                    max-width="300"
                  />
                </span>
              </template>
              <template #item="{ item }">
                <tr>
                  <td>{{ item.year }}</td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.maintenanceCosts"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.gridConsumptionPrice"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.directConsumptionPrice"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.storageConsumptionPrice"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.gridSupplyPrice"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.liquidity"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                </tr>
              </template>
              <template #body.append>
                <tr class="font-weight-bold text--primary">
                  <td>
                    {{ keyDataTotalText }}
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...maintenanceCosts.values()])"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="
                        sumValues([...gridConsumptionPrice.values()])
                      "
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="
                        sumValues([...directConsumptionPrice.values()])
                      "
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="
                        sumValues([...storageConsumptionPrice.values()])
                      "
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="sumValues([...gridSupplyPrice.values()])"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td></td>
                </tr>
              </template>
            </vcs-data-table>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-1" v-if="isPaginated">
          <v-col class="d-flex justify-center">
            <VcsLabel class="font-weight-bold">
              {{ $st('solarRevenue.keydata.hint') }}
            </VcsLabel>
            <VcsLabel>
              {{ $st('solarRevenue.keydata.hintText') }}
            </VcsLabel>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
  .borderCard {
    border-width: 2px;
    border-color: rgb(var(--v-theme-primary));
  }
</style>

<script setup lang="ts">
  import { computed, getCurrentInstance, PropType, ref } from 'vue';
  import {
    VDialog,
    VRow,
    VCard,
    VContainer,
    VCol,
    VIcon,
    VTooltip,
  } from 'vuetify/components';
  import {
    VcsButton,
    VcsDataTable,
    VcsSelect,
    VcsLabel,
    VcsFormattedNumber,
  } from '@vcmap/ui';
  import { sumValues } from '../../helper.js';

  const dialog = defineModel('dialog', {
    type: Boolean as PropType<boolean>,
    required: true,
  });

  const innerProps = defineProps({
    maintenanceCosts: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    gridConsumptionPrice: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    directConsumptionPrice: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    storageConsumptionPrice: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    gridSupplyPrice: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    coTwoSavings: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    solarPowerYield: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    liquidity: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    electricityDemand: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    storageLosses: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    directConsumption: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    storageConsumption: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    gridConsumption: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    gridSupply: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    hasSelectedModules: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    itemsPerPage: {
      type: Number as PropType<number>,
      default: 10,
    },
    isPaginated: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    maintenancePortion: {
      type: Number as PropType<number>,
      required: true,
    },
  });

  export type EnvironmentalBalance = {
    year: number;
    coTwoSavings: number;
  };

  export type EnergyBalance = {
    year: number;
    solarPowerYield: number;
    electricityDemand: number;
    storageLosses: number;
    directConsumption: number;
    storageConsumption: number;
    gridConsumption: number;
    gridSupply: number;
  };

  export type EnergyPriceBalance = {
    year: number;
    maintenanceCosts: number;
    gridConsumptionPrice: number;
    directConsumptionPrice: number;
    storageConsumptionPrice: number;
    gridSupplyPrice: number;
    liquidity: number;
  };

  const energyHeaders = [
    {
      title: 'solarRevenue.keydata.energyHeader.year',
      key: 'year',
    },
    {
      title: 'solarRevenue.keydata.energyHeader.solarPowerYield',
      key: 'solarPowerYield',
      toolTip: 'solarRevenue.keydata.energyHeader.tooltip.solarPowerYield',
    },
    {
      title: 'solarRevenue.keydata.energyHeader.electricityDemand',
      key: 'electricityDemand',
      toolTip: 'solarRevenue.keydata.energyHeader.tooltip.electricityDemand',
    },
    {
      title: 'solarRevenue.keydata.energyHeader.storageLosses',
      key: 'storageLosses',
      toolTip: 'solarRevenue.keydata.energyHeader.tooltip.storageLosses',
    },
    {
      title: 'solarRevenue.keydata.energyHeader.directConsumption',
      key: 'directConsumption',
      toolTip: 'solarRevenue.keydata.energyHeader.tooltip.directConsumption',
    },
    {
      title: 'solarRevenue.keydata.energyHeader.storageConsumption',
      key: 'storageConsumption',
      toolTip: 'solarRevenue.keydata.energyHeader.tooltip.storageConsumption',
    },
    {
      title: 'solarRevenue.keydata.energyHeader.gridConsumption',
      key: 'gridConsumption',
      toolTip: 'solarRevenue.keydata.energyHeader.tooltip.gridConsumption',
    },
    {
      title: 'solarRevenue.keydata.energyHeader.gridSupply',
      key: 'gridSupply',
      toolTip: 'solarRevenue.keydata.energyHeader.tooltip.gridSupply',
    },
  ];

  const environmentalBalanceHeaders = [
    {
      title: 'solarRevenue.keydata.environmentalBalanceHeader.year',
      key: 'year',
    },
    {
      title: 'solarRevenue.keydata.environmentalBalanceHeader.coTwoSavings',
      key: 'coTwoSavings',
      toolTip:
        'solarRevenue.keydata.environmentalBalanceHeader.tooltip.coTwoSavings',
    },
  ];

  const energyPriceHeaders = [
    {
      title: 'solarRevenue.keydata.energyPriceHeader.year',
      key: 'year',
    },
    {
      title: 'solarRevenue.keydata.energyPriceHeader.maintenanceCosts',
      key: 'maintenanceCosts',
      toolTip:
        'solarRevenue.keydata.energyPriceHeader.tooltip.maintenanceCosts',
    },
    {
      title: 'solarRevenue.keydata.energyPriceHeader.gridConsumptionPrice',
      key: 'gridConsumptionPrice',
      toolTip:
        'solarRevenue.keydata.energyPriceHeader.tooltip.gridConsumptionPrice',
    },
    {
      title: 'solarRevenue.keydata.energyPriceHeader.directConsumptionPrice',
      key: 'directConsumptionPrice',
      toolTip:
        'solarRevenue.keydata.energyPriceHeader.tooltip.directConsumptionPrice',
    },
    {
      title: 'solarRevenue.keydata.energyPriceHeader.storageConsumptionPrice',
      key: 'storageConsumptionPrice',
      toolTip:
        'solarRevenue.keydata.energyPriceHeader.tooltip.storageConsumptionPrice',
    },
    {
      title: 'solarRevenue.keydata.energyPriceHeader.gridSupplyPrice',
      key: 'gridSupplyPrice',
      toolTip: 'solarRevenue.keydata.energyPriceHeader.tooltip.gridSupplyPrice',
    },
    {
      title: 'solarRevenue.keydata.energyPriceHeader.liquidity',
      key: 'liquidity',
      toolTip: 'solarRevenue.keydata.energyPriceHeader.tooltip.liquidity',
    },
  ];

  const vm = getCurrentInstance()?.proxy;

  const keyDataTotalText = computed(() => {
    return innerProps.isPaginated
      ? `${vm?.$st('solarRevenue.keydata.total')} *`
      : vm?.$st('solarRevenue.keydata.total');
  });

  const chartTypes = computed(() => [
    { key: 'energy', title: vm?.$st('solarRevenue.keydata.type.energy') },
    {
      key: 'energyCosts',
      title: vm?.$st('solarRevenue.keydata.type.energyCosts'),
    },
    {
      key: 'environmentalBalance',
      title: vm?.$st('solarRevenue.keydata.type.environmentalBalance'),
    },
  ]);
  const selectedChartType = ref('energy');

  const localEnvironmentalBalance = computed(() => {
    const environmentalBalance: EnvironmentalBalance[] = [];
    innerProps.coTwoSavings.forEach((v, k) => {
      environmentalBalance.push({
        year: k,
        coTwoSavings: v,
      });
    });
    return environmentalBalance;
  });

  const localEnergyBalance = computed(() => {
    const energyBalance: EnergyBalance[] = [];
    innerProps.solarPowerYield.forEach((v, k) => {
      energyBalance.push({
        year: k,
        solarPowerYield: v,
        electricityDemand: innerProps.electricityDemand.get(k) || 0,
        storageLosses: innerProps.storageLosses.get(k) || 0,
        directConsumption: innerProps.directConsumption.get(k) || 0,
        storageConsumption: innerProps.storageConsumption.get(k) || 0,
        gridConsumption: innerProps.gridConsumption.get(k) || 0,
        gridSupply: innerProps.gridSupply.get(k) || 0,
      });
    });
    return energyBalance;
  });

  const localEnergyPriceBalance = computed(() => {
    const energyPriceBalance: EnergyPriceBalance[] = [];
    innerProps.maintenanceCosts.forEach((v, k) => {
      energyPriceBalance.push({
        year: k,
        maintenanceCosts: v,
        gridConsumptionPrice: innerProps.gridConsumptionPrice.get(k) || 0,
        directConsumptionPrice: innerProps.directConsumptionPrice.get(k) || 0,
        storageConsumptionPrice: innerProps.storageConsumptionPrice.get(k) || 0,
        gridSupplyPrice: innerProps.gridSupplyPrice.get(k) || 0,
        liquidity: innerProps.liquidity.get(k) || 0,
      });
    });
    return energyPriceBalance;
  });
</script>
