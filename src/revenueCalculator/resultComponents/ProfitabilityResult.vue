<template>
  <v-dialog v-model="dialog" width="700px">
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
          <v-icon class="mr-1 text--primary" size="16">mdi-finance</v-icon>
          <span
            class="d-inline-block user-select-none font-weight-bold text--primary"
          >
            {{ $t('solarRevenue.prof.title') }}
          </span>
        </h3>
        <v-row>
          <v-col class="d-flex justify-center">
            <v-card
              class="my-1 elevation-0 rounded-0 borderCard justify-center d-flex pa-1"
              outlined
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
              v-model="selectedChartType"
            />
          </v-col>
        </v-row>

        <VueApexCharts
          :key="chartTheme && isFinance"
          v-if="selectedChartType === 'revenue'"
          type="bar"
          :options="options"
          :series="series"
          height="600"
        />
        <VueApexCharts
          :key="chartTheme"
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
    inject,
    onUnmounted,
    PropType,
    Ref,
    ref,
  } from 'vue';
  import { VDialog, VRow, VCard, VContainer, VIcon, VCol } from 'vuetify/lib';
  import {
    getColorByKey,
    VcsButton,
    VcsUiApp,
    VcsSelect,
    VcsLabel,
  } from '@vcmap/ui';
  import VueApexCharts from 'vue-apexcharts';
  import { downloadSVG } from '../../helper.js';

  export default defineComponent({
    name: 'ProfitabilityResult',
    components: {
      VcsLabel,
      VcsSelect,
      VueApexCharts,
      VcsButton,
      VRow,
      VDialog,
      VCard,
      VContainer,
      VIcon,
      VCol,
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
      chartTheme: {
        type: String as PropType<string>,
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
    },

    setup(props) {
      const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
      const vm = getCurrentInstance()?.proxy;
      const dialog: Ref<boolean> = ref(false);

      const chartTypes = computed(() => [
        { value: 'revenue', text: vm?.$t('solarRevenue.prof.type.revenue') },
        {
          value: 'liquidity',
          text: vm?.$t('solarRevenue.prof.type.liquidity'),
        },
      ]);
      const selectedChartType = ref('revenue');

      const primary = ref(getColorByKey('primary'));
      const primaryLighten1 = ref(getColorByKey('primary', 'lighten1'));
      const primaryDarken1 = ref(getColorByKey('primary', 'darken1'));
      const primaryDarken2 = ref(getColorByKey('primary', 'darken2'));
      const baseLighten4 = ref(getColorByKey('base', 'lighten4'));
      const baseDarken1 = ref(getColorByKey('base', 'darken1'));
      const baseDarken2 = ref(getColorByKey('base', 'darken2'));
      const baseDarken3 = ref(getColorByKey('base', 'darken3'));
      const baseDarken4 = ref(getColorByKey('base', 'darken4'));
      const themeChangedListener = app.themeChanged.addEventListener(() => {
        primary.value = getColorByKey('primary');
        primaryLighten1.value = getColorByKey('primary', 'lighten1');
        primaryDarken1.value = getColorByKey('primary', 'darken1');
        primaryDarken2.value = getColorByKey('primary', 'darken2');
        baseLighten4.value = getColorByKey('base', 'lighten4');
        baseDarken1.value = getColorByKey('base', 'darken1');
        baseDarken2.value = getColorByKey('base', 'darken2');
        baseDarken3.value = getColorByKey('base', 'darken3');
        baseDarken4.value = getColorByKey('base', 'darken4');
      });

      const liquiditySeries = computed(() => [
        {
          name: vm?.$t('solarRevenue.prof.chart.liquidity.series'),
          data: [...props.liquidity.values()].map((v) => v | 0),
        },
      ]);

      const series = computed(() => {
        const noFinanceExpenses = [
          {
            name: vm?.$t('solarRevenue.prof.chart.plan.maintenanceCosts'),
            group: 'expenses',
            data: [...props.maintenanceCosts.values()]
              .map((v) => v | 0)
              .map(Math.abs),
          },
          {
            name: vm?.$t('solarRevenue.prof.chart.plan.gridConsumptionPrice'),
            group: 'expenses',
            data: [...props.gridConsumptionPrice.values()]
              .map((v) => v | 0)
              .map(Math.abs),
          },
        ];

        const financeExpenses = [
          {
            name: vm?.$t('solarRevenue.prof.chart.plan.repaymentRate'),
            group: 'expenses',
            data: [...props.repaymentRate.values()]
              .map((v) => v | 0)
              .map(Math.abs),
            color: baseDarken3.value,
          },
          {
            name: vm?.$t('solarRevenue.prof.chart.plan.interestAmount'),
            group: 'expenses',
            data: [...props.interestAmount.values()]
              .map((v) => v | 0)
              .map(Math.abs),
          },
        ];
        const earnings = [
          {
            name: vm?.$t('solarRevenue.prof.chart.plan.directConsumptionPrice'),
            group: 'income',
            data: [...props.directConsumptionPrice.values()]
              .map((v) => v | 0)
              .map(Math.abs),
          },
          {
            name: vm?.$t(
              'solarRevenue.prof.chart.plan.storageConsumptionPrice',
            ),
            group: 'income',
            data: [...props.storageConsumptionPrice.values()]
              .map((v) => v | 0)
              .map(Math.abs),
          },
          {
            name: vm?.$t('solarRevenue.prof.chart.plan.gridSupplyPrice'),
            group: 'income',
            data: [...props.gridSupplyPrice.values()]
              .map((v) => v | 0)
              .map(Math.abs),
          },
        ];
        return props.isFinance
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
            categories: [...props.liquidity.keys()],
            labels: {
              formatter(val: string): string {
                return `${val} €`;
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
              formatter(val: string): string {
                return `${val} €`;
              },
            },
          },
          theme: {
            mode: props.chartTheme,
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
        return props.isFinance
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
            categories: [...props.directConsumptionPrice.keys()],
            labels: {
              formatter(val: string): string {
                return `${val} €`;
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
              formatter(val: string): string {
                return `${val} €`;
              },
            },
          },
          theme: {
            mode: props.chartTheme,
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

      return {
        dialog,
        options,
        series,
        liquidityOptions,
        liquiditySeries,
        chartTypes,
        selectedChartType,
      };
    },
  });
</script>
