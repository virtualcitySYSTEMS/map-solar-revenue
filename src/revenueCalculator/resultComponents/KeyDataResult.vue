<template>
  <v-sheet>
    <v-row no-gutters>
      <v-dialog v-model="dialog" width="1100px">
        <template #activator="{ on }">
          <VcsButton
            icon="mdi-open-in-new"
            v-on="on"
            :disabled="!hasSelectedModules"
          />
        </template>
        <v-card>
          <v-container class="px-5 py-1">
            <h3 class="d-flex align-center px-0 py-3">
              <v-icon class="mr-1 text--primary" size="16"
                >mdi-file-chart-outline</v-icon
              >
              <span
                class="d-inline-block user-select-none font-weight-bold text--primary"
              >
                {{ $t('solarRevenue.keydata.title') }}
              </span>
            </h3>
            <v-row>
              <v-col class="d-flex justify-center">
                <v-card
                  class="my-1 elevation-0 rounded-0 borderCard justify-center d-flex pa-1"
                  outlined
                  width="700px"
                >
                  {{ $t('solarRevenue.keydata.description') }}
                </v-card>
              </v-col>
            </v-row>
            <v-row no-gutters class="px-0 py-1 d-flex justify-center">
              <v-col cols="3">
                <VcsLabel class="font-weight-bold">{{
                  $t('solarRevenue.keydata.typeLabel')
                }}</VcsLabel>
              </v-col>
              <v-col cols="5">
                <VcsSelect
                  id="chartTypeEnergy"
                  :items="chartTypes"
                  v-model="selectedChartType"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="px-0 py-3">
              <v-col class="d-flex justify-center">
                <vcs-data-table
                  v-if="selectedChartType === 'environmentalBalance'"
                  class="elevation-0"
                  :items="localEnvironmentalBalance"
                  item-key="year"
                  :show-select="false"
                  :single-select="false"
                  :show-searchbar="false"
                  :headers="environmentalBalanceHeaders"
                  v-model="localEnvironmentalBalance"
                >
                  <template
                    v-for="(h, index) in environmentalBalanceHeaders"
                    #[`header.${h.value}`]="{ header }"
                  >
                    <v-tooltip
                      bottom
                      v-if="header.toolTip !== undefined"
                      :key="index"
                    >
                      <template #activator="{ on }">
                        <span v-on="on">{{ header.text }}</span>
                      </template>
                      <span>{{ header.toolTip }}</span>
                    </v-tooltip>
                    <span v-else :key="index">{{ header.text }}</span>
                  </template>
                  <template #item="{ item }">
                    <tr>
                      <td>{{ item.year }}</td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.coTwoSavings"
                          unit="kg"
                          :fraction-digits="0"
                        />
                      </td>
                    </tr>
                  </template>
                  <template #body.append>
                    <tr class="font-weight-bold text--primary">
                      <td>{{ $t('solarRevenue.keydata.total') + ' *' }}</td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...coTwoSavings.values()])"
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
                >
                  <template
                    v-for="(h, index) in energyHeaders"
                    #[`header.${h.value}`]="{ header }"
                  >
                    <v-tooltip
                      bottom
                      v-if="header.toolTip !== undefined"
                      :key="index"
                    >
                      <template #activator="{ on }">
                        <span v-on="on">{{ header.text }}</span>
                      </template>
                      <span>{{ header.toolTip }}</span>
                    </v-tooltip>
                    <span v-else :key="index">{{ header.text }}</span>
                  </template>
                  <template #item="{ item }">
                    <tr>
                      <td>{{ item.year }}</td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.solarPowerYield"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.electricityDemand"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.storageLosses"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.directConsumption"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.storageConsumption"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.gridConsumption"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.gridSupply"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                    </tr>
                  </template>
                  <template #body.append>
                    <tr class="font-weight-bold text--primary">
                      <td>{{ $t('solarRevenue.keydata.total') + ' *' }}</td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...solarPowerYield.values()])"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...electricityDemand.values()])"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...storageLosses.values()])"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...directConsumption.values()])"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...storageConsumption.values()])"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...gridConsumption.values()])"
                          unit="kWh"
                          :fraction-digits="0"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...gridSupply.values()])"
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
                >
                  <template
                    v-for="(h, index) in energyPriceHeaders"
                    #[`header.${h.value}`]="{ header }"
                  >
                    <v-tooltip
                      bottom
                      v-if="header.toolTip !== undefined"
                      :key="index"
                    >
                      <template #activator="{ on }">
                        <span v-on="on">{{ header.text }}</span>
                      </template>
                      <span>{{ header.toolTip }}</span>
                    </v-tooltip>
                    <span v-else :key="index">{{ header.text }}</span>
                  </template>
                  <template #item="{ item }">
                    <tr>
                      <td>{{ item.year }}</td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.maintenanceCosts"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.gridConsumptionPrice"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.directConsumptionPrice"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.storageConsumptionPrice"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.gridSupplyPrice"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="item.liquidity"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                    </tr>
                  </template>
                  <template #body.append>
                    <tr class="font-weight-bold text--primary">
                      <td>{{ $t('solarRevenue.keydata.total') + ' *' }}</td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...maintenanceCosts.values()])"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...gridConsumptionPrice.values()])"
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="
                            sumValues([...directConsumptionPrice.values()])
                          "
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="
                            sumValues([...storageConsumptionPrice.values()])
                          "
                          unit="€"
                          :fraction-digits="2"
                        />
                      </td>
                      <td>
                        <VcsFormattedNumber
                          id="formattedNumber"
                          :value="sumValues([...gridSupplyPrice.values()])"
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
            <v-row no-gutters class="px-0 py-1">
              <v-col class="d-flex justify-center">
                <VcsLabel class="font-weight-bold">
                  {{ $t('solarRevenue.keydata.hint') }}
                </VcsLabel>
                <VcsLabel>
                  {{ $t('solarRevenue.keydata.hintText') }}
                </VcsLabel>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-dialog>
    </v-row>
  </v-sheet>
</template>

<style scoped lang="scss">
  .borderCard.v-sheet.v-card {
    border-width: 2px;
    border-color: var(--v-primary-base);
  }
</style>

<script lang="ts">
  import {
    computed,
    defineComponent,
    getCurrentInstance,
    PropType,
    Ref,
    ref,
  } from 'vue';
  import {
    VDialog,
    VRow,
    VCard,
    VSheet,
    VContainer,
    VCol,
    VIcon,
    VTooltip,
  } from 'vuetify/lib';
  import {
    VcsButton,
    VcsDataTable,
    VcsSelect,
    VcsLabel,
    VcsFormattedNumber,
  } from '@vcmap/ui';
  import { sumValues } from '../../helper.js';

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

  const energyHeadersDefault = [
    {
      text: 'solarRevenue.keydata.energyHeader.year',
      value: 'year',
    },
    {
      text: 'solarRevenue.keydata.energyHeader.solarPowerYield',
      value: 'solarPowerYield',
      toolTip: '[kWh]',
    },
    {
      text: 'solarRevenue.keydata.energyHeader.electricityDemand',
      value: 'electricityDemand',
      toolTip: '[kWh]',
    },
    {
      text: 'solarRevenue.keydata.energyHeader.storageLosses',
      value: 'storageLosses',
      toolTip: '[kWh]',
    },
    {
      text: 'solarRevenue.keydata.energyHeader.directConsumption',
      value: 'directConsumption',
      toolTip: '[kWh]',
    },
    {
      text: 'solarRevenue.keydata.energyHeader.storageConsumption',
      value: 'storageConsumption',
      toolTip: '[kWh]',
    },
    {
      text: 'solarRevenue.keydata.energyHeader.gridConsumption',
      value: 'gridConsumption',
      toolTip: '[kWh]',
    },
    {
      text: 'solarRevenue.keydata.energyHeader.gridSupply',
      value: 'gridSupply',
      toolTip: '[kWh]',
    },
  ];

  const environmentalBalanceHeadersDefault = [
    {
      text: 'solarRevenue.keydata.environmentalBalanceHeader.year',
      value: 'year',
    },
    {
      text: 'solarRevenue.keydata.environmentalBalanceHeader.coTwoSavings',
      value: 'coTwoSavings',
      toolTip: '[kg]',
    },
  ];

  const energyPriceHeadersDefault = [
    {
      text: 'solarRevenue.keydata.energyPriceHeader.year',
      value: 'year',
    },
    {
      text: 'solarRevenue.keydata.energyPriceHeader.maintenanceCosts',
      value: 'maintenanceCosts',
      toolTip: '[€]',
    },
    {
      text: 'solarRevenue.keydata.energyPriceHeader.gridConsumptionPrice',
      value: 'gridConsumptionPrice',
      toolTip: '[€]',
    },
    {
      text: 'solarRevenue.keydata.energyPriceHeader.directConsumptionPrice',
      value: 'directConsumptionPrice',
      toolTip: '[€]',
    },
    {
      text: 'solarRevenue.keydata.energyPriceHeader.storageConsumptionPrice',

      value: 'storageConsumptionPrice',
      toolTip: '[€]',
    },
    {
      text: 'solarRevenue.keydata.energyPriceHeader.gridSupplyPrice',
      value: 'gridSupplyPrice',
      toolTip: '[€]',
    },
    {
      text: 'solarRevenue.keydata.energyPriceHeader.liquidity',
      value: 'liquidity',
      toolTip: '[€]',
    },
  ];

  export default defineComponent({
    name: 'KeyDataResult',
    methods: { sumValues },
    components: {
      VcsButton,
      VRow,
      VCol,
      VDialog,
      VCard,
      VSheet,
      VContainer,
      VcsDataTable,
      VIcon,
      VTooltip,
      VcsSelect,
      VcsLabel,
      VcsFormattedNumber,
    },
    props: {
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
    },
    setup(props) {
      const dialog: Ref<boolean> = ref(false);

      const vm = getCurrentInstance()?.proxy;

      const energyHeaders = energyHeadersDefault;
      const energyPriceHeaders = energyPriceHeadersDefault;
      const environmentalBalanceHeaders = environmentalBalanceHeadersDefault;

      const chartTypes = computed(() => [
        { value: 'energy', text: vm?.$t('solarRevenue.keydata.type.energy') },
        {
          value: 'energyCosts',
          text: vm?.$t('solarRevenue.keydata.type.energyCosts'),
        },
        {
          value: 'environmentalBalance',
          text: vm?.$t('solarRevenue.keydata.type.environmentalBalance'),
        },
      ]);
      const selectedChartType = ref('energy');

      const localEnvironmentalBalance = computed(() => {
        const environmentalBalance: EnvironmentalBalance[] = [];
        props.coTwoSavings.forEach((v, k) => {
          environmentalBalance.push({
            year: k,
            coTwoSavings: v,
          });
        });
        return environmentalBalance;
      });

      const localEnergyBalance = computed(() => {
        const energyBalance: EnergyBalance[] = [];
        props.solarPowerYield.forEach((v, k) => {
          energyBalance.push({
            year: k,
            solarPowerYield: v,
            electricityDemand: props.electricityDemand.get(k) || 0,
            storageLosses: props.storageLosses.get(k) || 0,
            directConsumption: props.directConsumption.get(k) || 0,
            storageConsumption: props.storageConsumption.get(k) || 0,
            gridConsumption: props.gridConsumption.get(k) || 0,
            gridSupply: props.gridSupply.get(k) || 0,
          });
        });
        return energyBalance;
      });

      const localEnergyPriceBalance = computed(() => {
        const energyPriceBalance: EnergyPriceBalance[] = [];
        props.maintenanceCosts.forEach((v, k) => {
          energyPriceBalance.push({
            year: k,
            maintenanceCosts: v,
            gridConsumptionPrice: props.gridConsumptionPrice.get(k) || 0,
            directConsumptionPrice: props.directConsumptionPrice.get(k) || 0,
            storageConsumptionPrice: props.storageConsumptionPrice.get(k) || 0,
            gridSupplyPrice: props.gridSupplyPrice.get(k) || 0,
            liquidity: props.liquidity.get(k) || 0,
          });
        });
        return energyPriceBalance;
      });

      return {
        dialog,
        localEnergyBalance,
        energyHeaders,
        selectedChartType,
        chartTypes,
        localEnergyPriceBalance,
        energyPriceHeaders,
        localEnvironmentalBalance,
        environmentalBalanceHeaders,
      };
    },
  });
</script>
