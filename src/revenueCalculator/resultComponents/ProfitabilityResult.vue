<template>
  <v-dialog v-model="dialog" width="700px">
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
          <v-icon class="mr-1 text-primary" size="16">mdi-finance</v-icon>
          <span
            class="d-inline-block user-select-none font-weight-bold text-primary"
          >
            {{ $st('solarRevenue.prof.title') }}
          </span>
        </h3>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card
              class="my-1 elevation-0 rounded-0 borderCard justify-center d-flex pa-1"
              variant="outlined"
              width="600px"
              v-if="selectedChartType === 'revenue'"
            >
              {{
                $st('solarRevenue.prof.description.revenue', {
                  lifeTime: lifeTime,
                })
              }}
            </v-card>
            <v-card
              class="my-1 elevation-0 rounded-0 borderCard justify-center d-flex pa-1"
              variant="outlined"
              width="600px"
              v-if="selectedChartType === 'liquidity'"
            >
              {{
                $st('solarRevenue.prof.description.liquidity', {
                  lifeTime: lifeTime,
                })
              }}
            </v-card>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-1 d-flex justify-center">
          <v-col cols="5">
            <VcsLabel class="font-weight-bold">
              {{ $st('solarRevenue.prof.typeLabel') }}
            </VcsLabel>
          </v-col>
          <v-col cols="4">
            <VcsSelect
              id="chartTypeRevenue"
              :items="chartTypes"
              item-title="title"
              item-value="key"
              v-model="selectedChartType"
            />
          </v-col>
        </v-row>

        <VueApexCharts
          v-if="selectedChartType === 'revenue'"
          type="bar"
          :options="options"
          :series="series"
          height="600"
        />
        <VueApexCharts
          v-if="selectedChartType === 'liquidity'"
          type="bar"
          :options="liquidityOptions"
          :series="liquiditySeries"
          height="600"
        />
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
  import { useTheme } from 'vuetify';
  import { computed, getCurrentInstance, inject, PropType, ref } from 'vue';
  import {
    VDialog,
    VRow,
    VCard,
    VContainer,
    VIcon,
    VCol,
  } from 'vuetify/components';
  import { VcsButton, VcsUiApp, VcsSelect, VcsLabel } from '@vcmap/ui';
  import VueApexCharts from 'vue3-apexcharts';
  import { downloadSVG, getSolarColorByKey } from '../../helper.js';
  import { SolarColors } from '../../solarOptions.js';

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
    repaymentRate: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    interestAmount: {
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
    liquidity: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    isFinance: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    hasSelectedModules: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    lifeTime: {
      type: Number as PropType<number>,
      required: true,
    },
    colorOptions: {
      type: Object as PropType<SolarColors>,
      required: true,
    },
  });
  const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
  const vm = getCurrentInstance()?.proxy;

  const chartTypes = computed(() => [
    { key: 'revenue', title: vm?.$st('solarRevenue.prof.type.revenue') },
    {
      key: 'liquidity',
      title: vm?.$st('solarRevenue.prof.type.liquidity'),
    },
  ]);
  const selectedChartType = ref('revenue');

  const positiveLiquidityColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.liquidity,
      'positiveLiquidityColor',
    ),
  );
  const negativeLiquidityColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.liquidity,
      'negativeLiquidityColor',
    ),
  );
  const directConsumptionPriceColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.revenue,
      'directConsumptionPriceColor',
    ),
  );
  const storageConsumptionPriceColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.revenue,
      'storageConsumptionPriceColor',
    ),
  );
  const gridSupplyPriceColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.revenue,
      'gridSupplyPriceColor',
    ),
  );
  const maintenanceCostsColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.revenue,
      'maintenanceCostsColor',
    ),
  );
  const gridConsumptionPriceColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.revenue,
      'gridConsumptionPriceColor',
    ),
  );
  const repaymentRateColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.revenue,
      'repaymentRateColor',
    ),
  );
  const interestAmountColor = computed(() =>
    getSolarColorByKey(
      app,
      innerProps.colorOptions.revenue,
      'interestAmountColor',
    ),
  );
  const strokeColor = computed(() =>
    getSolarColorByKey(app, innerProps.colorOptions.global, 'strokeColor'),
  );

  const liquiditySeries = computed(() => [
    {
      name: vm?.$st('solarRevenue.prof.chart.liquidity.series'),
      data: [...innerProps.liquidity.values()].map((v) => v | 0),
    },
  ]);

  const series = computed(() => {
    const noFinanceExpenses = [
      {
        name: vm?.$st('solarRevenue.prof.chart.plan.maintenanceCosts'),
        group: 'expenses',
        data: [...innerProps.maintenanceCosts.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
      {
        name: vm?.$st('solarRevenue.prof.chart.plan.gridConsumptionPrice'),
        group: 'expenses',
        data: [...innerProps.gridConsumptionPrice.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
    ];

    const financeExpenses = [
      {
        name: vm?.$st('solarRevenue.prof.chart.plan.repaymentRate'),
        group: 'expenses',
        data: [...innerProps.repaymentRate.values()]
          .map((v) => v | 0)
          .map(Math.abs),
        color: repaymentRateColor.value,
      },
      {
        name: vm?.$st('solarRevenue.prof.chart.plan.interestAmount'),
        group: 'expenses',
        data: [...innerProps.interestAmount.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
    ];
    const earnings = [
      {
        name: vm?.$st('solarRevenue.prof.chart.plan.directConsumptionPrice'),
        group: 'income',
        data: [...innerProps.directConsumptionPrice.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
      {
        name: vm?.$st('solarRevenue.prof.chart.plan.storageConsumptionPrice'),
        group: 'income',
        data: [...innerProps.storageConsumptionPrice.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
      {
        name: vm?.$st('solarRevenue.prof.chart.plan.gridSupplyPrice'),
        group: 'income',
        data: [...innerProps.gridSupplyPrice.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
    ];
    return innerProps.isFinance
      ? [...noFinanceExpenses, ...financeExpenses, ...earnings]
      : [...noFinanceExpenses, ...earnings];
  });

  const liquidityOptions = computed(() => {
    return {
      chart: {
        id: 'liquidity',
        background: 'rgba(0, 0, 0, 0)',
        toolbar: {
          tools: {
            download: downloadSVG,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 1,
          horizontal: true,
        },
      },
      colors: [
        function chColor({ value }: { value: number }): string {
          if (value < 0) {
            return negativeLiquidityColor.value;
          } else {
            return positiveLiquidityColor.value;
          }
        },
      ],
      xaxis: {
        categories: [...innerProps.liquidity.keys()],
        labels: {
          formatter(val: number): string {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(val);
          },
        },
      },
      yaxis: {
        labels: {
          formatter(val: string): string {
            return `${val}. ${vm
              ?.$st('solarRevenue.prof.chart.yUnit')
              .toString()}`;
          },
        },
      },
      tooltip: {
        y: {
          formatter(val: number): string {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(val);
          },
        },
      },
      theme: {
        mode: useTheme().global.name.value,
      },
      grid: {
        show: false,
      },
      stroke: {
        show: true,
        colors: [strokeColor.value],
        width: 1,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        labels: {
          useSeriesColors: true,
        },
      },
    };
  });

  const revenueColors = computed(() => {
    const noFinanceExpenses = [
      maintenanceCostsColor.value,
      gridConsumptionPriceColor.value,
    ];
    const financeExpenses = [
      repaymentRateColor.value,
      interestAmountColor.value,
    ];
    const earnings = [
      directConsumptionPriceColor.value,
      storageConsumptionPriceColor.value,
      gridSupplyPriceColor.value,
    ];
    return innerProps.isFinance
      ? [...noFinanceExpenses, ...financeExpenses, ...earnings]
      : [...noFinanceExpenses, ...earnings];
  });

  const options = computed(() => {
    return {
      chart: {
        id: 'revenueChart',
        stacked: true,
        background: 'rgba(0, 0, 0, 0)',
        toolbar: {
          tools: {
            download: downloadSVG,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 1,
          horizontal: true,
        },
      },
      colors: revenueColors.value,
      xaxis: {
        categories: [...innerProps.directConsumptionPrice.keys()],
        labels: {
          formatter(val: number): string {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(val);
          },
        },
      },
      yaxis: {
        labels: {
          formatter(val: string): string {
            return `${val}. ${vm
              ?.$st('solarRevenue.prof.chart.yUnit')
              .toString()}`;
          },
        },
      },
      tooltip: {
        y: {
          formatter(val: number): string {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(val);
          },
        },
      },
      theme: {
        mode: useTheme().global.name.value,
      },
      grid: {
        show: false,
      },
      stroke: {
        show: true,
        colors: [strokeColor.value],
        width: 1,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        labels: {
          useSeriesColors: true,
        },
      },
    };
  });
</script>
