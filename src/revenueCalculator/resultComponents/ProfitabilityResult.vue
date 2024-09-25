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
            {{ $t('solarRevenue.prof.title') }}
          </span>
        </h3>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card
              class="my-1 elevation-0 rounded-0 borderCard justify-center d-flex pa-1"
              variant="outlined"
              width="600px"
            >
              {{ $t('solarRevenue.prof.description', { lifeTime: lifeTime }) }}
            </v-card>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-1 d-flex justify-center">
          <v-col cols="5">
            <VcsLabel class="font-weight-bold">
              {{ $t('solarRevenue.prof.typeLabel') }}
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
  import {
    computed,
    getCurrentInstance,
    inject,
    onUnmounted,
    PropType,
    Ref,
    ref,
  } from 'vue';
  import {
    VDialog,
    VRow,
    VCard,
    VContainer,
    VIcon,
    VCol,
  } from 'vuetify/components';
  import {
    getColorByKey,
    VcsButton,
    VcsUiApp,
    VcsSelect,
    VcsLabel,
  } from '@vcmap/ui';
  import VueApexCharts from 'vue3-apexcharts';
  import { downloadSVG } from '../../helper.js';

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
  });
  const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
  const vm = getCurrentInstance()?.proxy;
  const dialog: Ref<boolean> = ref(false);

  const chartTypes = computed(() => [
    { key: 'revenue', title: vm?.$t('solarRevenue.prof.type.revenue') },
    {
      key: 'liquidity',
      title: vm?.$t('solarRevenue.prof.type.liquidity'),
    },
  ]);
  const selectedChartType = ref('revenue');

  const primary = ref(getColorByKey(app, 'primary'));
  const primaryLighten1 = ref(getColorByKey(app, 'primary', 'lighten-1'));
  const primaryDarken1 = ref(getColorByKey(app, 'primary', 'darken-1'));
  const primaryDarken2 = ref(getColorByKey(app, 'primary', 'darken-2'));
  const baseLighten4 = ref(getColorByKey(app, 'base', 'lighten-4'));
  const baseDarken1 = ref(getColorByKey(app, 'base', 'darken-1'));
  const baseDarken2 = ref(getColorByKey(app, 'base', 'darken-2'));
  const baseDarken3 = ref(getColorByKey(app, 'base', 'darken-3'));
  const baseDarken4 = ref(getColorByKey(app, 'base', 'darken-4'));
  const themeChangedListener = app.themeChanged.addEventListener(() => {
    primary.value = getColorByKey(app, 'primary');
    primaryLighten1.value = getColorByKey(app, 'primary', 'lighten-1');
    primaryDarken1.value = getColorByKey(app, 'primary', 'darken-1');
    primaryDarken2.value = getColorByKey(app, 'primary', 'darken-2');
    baseLighten4.value = getColorByKey(app, 'base', 'lighten-4');
    baseDarken1.value = getColorByKey(app, 'base', 'darken-1');
    baseDarken2.value = getColorByKey(app, 'base', 'darken-2');
    baseDarken3.value = getColorByKey(app, 'base', 'darken-3');
    baseDarken4.value = getColorByKey(app, 'base', 'darken-4');
  });

  const liquiditySeries = computed(() => [
    {
      name: vm?.$t('solarRevenue.prof.chart.liquidity.series'),
      data: [...innerProps.liquidity.values()].map((v) => v | 0),
    },
  ]);

  const series = computed(() => {
    const noFinanceExpenses = [
      {
        name: vm?.$t('solarRevenue.prof.chart.plan.maintenanceCosts'),
        group: 'expenses',
        data: [...innerProps.maintenanceCosts.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
      {
        name: vm?.$t('solarRevenue.prof.chart.plan.gridConsumptionPrice'),
        group: 'expenses',
        data: [...innerProps.gridConsumptionPrice.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
    ];

    const financeExpenses = [
      {
        name: vm?.$t('solarRevenue.prof.chart.plan.repaymentRate'),
        group: 'expenses',
        data: [...innerProps.repaymentRate.values()]
          .map((v) => v | 0)
          .map(Math.abs),
        color: baseDarken3.value,
      },
      {
        name: vm?.$t('solarRevenue.prof.chart.plan.interestAmount'),
        group: 'expenses',
        data: [...innerProps.interestAmount.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
    ];
    const earnings = [
      {
        name: vm?.$t('solarRevenue.prof.chart.plan.directConsumptionPrice'),
        group: 'income',
        data: [...innerProps.directConsumptionPrice.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
      {
        name: vm?.$t('solarRevenue.prof.chart.plan.storageConsumptionPrice'),
        group: 'income',
        data: [...innerProps.storageConsumptionPrice.values()]
          .map((v) => v | 0)
          .map(Math.abs),
      },
      {
        name: vm?.$t('solarRevenue.prof.chart.plan.gridSupplyPrice'),
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
            return baseDarken1.value;
          } else {
            return primary.value;
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
              ?.$t('solarRevenue.prof.chart.yUnit')
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
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        labels: {
          useSeriesColors: true,
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: [baseLighten4.value],
      },
    };
  });

  const revenueColors = computed(() => {
    const noFinanceExpenses = [baseDarken1.value, baseDarken2.value];
    const financeExpenses = [baseDarken3.value, baseDarken4.value];
    const earnings = [
      primaryLighten1.value,
      primaryDarken1.value,
      primaryDarken2.value,
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
              ?.$t('solarRevenue.prof.chart.yUnit')
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
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        labels: {
          useSeriesColors: true,
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: [baseLighten4.value],
      },
    };
  });

  onUnmounted(() => {
    themeChangedListener();
  });
</script>
