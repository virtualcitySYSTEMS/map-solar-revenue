<template>
  <v-dialog v-model="dialog" width="600px">
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
          <v-icon class="mr-1 text--primary" size="16">mdi-molecule-co2</v-icon>
          <span
            class="d-inline-block user-select-none font-weight-bold text--primary"
          >
            {{ $t('solarRevenue.cotwo.title') }}
          </span>
        </h3>
        <VueApexCharts
          :key="chartTheme"
          v-if="coTwoSavings.size > 0"
          type="bar"
          :options="options"
          :series="series"
          height="500"
        />
        <v-divider />
        <v-row no-gutters class="px-0 py-0 font-weight-bold">
          <v-col class="d-flex justify-start">
            <VcsLabel>{{ $t('solarRevenue.cotwo.totalEmission') }}</VcsLabel>
          </v-col>
          <v-col class="d-flex justify-end">
            <VcsLabel>
              <VcsFormattedNumber
                id="formattedNumber"
                :value="totalCoTwoEmission"
                unit="kg"
                :fraction-digits="0"
              />
            </VcsLabel>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-0 font-weight-bold">
          <v-col class="d-flex justify-start">
            <VcsLabel>{{ $t('solarRevenue.cotwo.totalSavings') }}</VcsLabel>
          </v-col>
          <v-col class="d-flex justify-end">
            <VcsLabel>
              <VcsFormattedNumber
                id="formattedNumber"
                :value="totalCoTwoSavings"
                unit="kg"
                :fraction-digits="0"
              />
            </VcsLabel>
          </v-col>
        </v-row>
        <v-divider />
        <v-row no-gutters class="px-1 py-1">
          <v-col class="text-justify">
            {{ $t('solarRevenue.cotwo.text1') }}
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 py-1" v-if="amortization > 0">
          <v-col class="text-justify d-flex justify-center font-weight-bold">
            {{ $t('solarRevenue.cotwo.text2') }}
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 py-1" v-if="amortization > 0">
          <v-col class="d-flex justify-center font-weight-bold text--primary">
            <VcsFormattedNumber
              id="formattedNumber"
              :value="amortization"
              :unit="$t('solarRevenue.cotwo.unit').toString()"
              :fraction-digits="2"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 py-1" v-if="amortization <= 0">
          <v-col class="text-justify d-flex justify-center font-weight-bold">
            {{ $t('solarRevenue.cotwo.text3') }}
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 pt-1 pb-3">
          <v-col class="text-justify">
            {{
              $t('solarRevenue.cotwo.text4', {
                germanPowerMixYear,
              })
            }}
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

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
  import {
    VCard,
    VContainer,
    VDialog,
    VIcon,
    VRow,
    VCol,
    VDivider,
  } from 'vuetify/lib';
  import {
    VcsButton,
    getColorByKey,
    VcsUiApp,
    VcsLabel,
    VcsFormattedNumber,
  } from '@vcmap/ui';
  import VueApexCharts from 'vue-apexcharts';
  import { downloadSVG } from '../../helper.js';

  export default defineComponent({
    name: 'CoTwoResult',

    components: {
      VcsLabel,
      VcsButton,
      VDialog,
      VueApexCharts,
      VContainer,
      VCard,
      VIcon,
      VRow,
      VCol,
      VDivider,
      VcsFormattedNumber,
    },

    props: {
      coTwoSavings: {
        type: Map as PropType<Map<number, number>>,
        required: true,
      },
      coTwoCosts: {
        type: Map as PropType<Map<number, number>>,
        required: true,
      },
      chartTheme: {
        type: String as PropType<string>,
        required: true,
      },
      hasSelectedModules: {
        type: Boolean as PropType<boolean>,
        required: true,
      },
      germanPowerMixYear: {
        type: Number as PropType<number>,
        required: true,
      },
    },

    setup(props) {
      const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
      const vm = getCurrentInstance()?.proxy;
      const dialog: Ref<boolean> = ref(false);
      const primary = ref(getColorByKey('primary'));
      const baseDarken1 = ref(getColorByKey('base', 'darken1'));
      const baseLighten4 = ref(getColorByKey('base', 'lighten4'));
      const themeChangedListener = app.themeChanged.addEventListener(() => {
        primary.value = getColorByKey('primary');
        baseLighten4.value = getColorByKey('base', 'lighten4');
        baseDarken1.value = getColorByKey('base', 'darken1');
      });

      const totalCoTwoEmission = computed(() => {
        return props.coTwoCosts.size
          ? ([...props.coTwoCosts.values()] || [0]).reduce(
              (acc: number, val: number) => {
                return acc + val;
              },
            )
          : 0;
      });
      const totalCoTwoSavings = computed(() => {
        return props.coTwoSavings.size
          ? [...props.coTwoSavings.values()].reduce(
              (acc: number, val: number) => {
                return acc + val;
              },
            )
          : 0;
      });

      const amortization = computed(() => {
        let amort = 0;
        props.coTwoSavings.forEach((v, k) => {
          const costs = props.coTwoCosts.get(k) || 0;
          if (costs !== 0 && v !== 0) {
            amort = k + costs / (costs + v) - 1;
          }
        });
        return amort;
      });

      const options = computed(() => {
        return {
          chart: {
            id: 'coTwoChart',
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
          colors: [baseDarken1.value, primary.value],
          xaxis: {
            categories: [...props.coTwoSavings.keys()],
            labels: {
              formatter(val: string): string {
                return `${val} kg`;
              },
            },
          },
          yaxis: {
            labels: {
              formatter(val: string): string {
                return `${val}. ${vm
                  ?.$t('solarRevenue.cotwo.chart.yUnit')
                  .toString()}`;
              },
            },
          },
          tooltip: {
            y: {
              formatter(val: string): string {
                return `${val} kg`;
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
      const series = computed(() => [
        {
          name: vm?.$t('solarRevenue.cotwo.chart.seriesEmission'),
          data: [...props.coTwoCosts.values()].map((v) => v | 0).map(Math.abs),
        },
        {
          name: vm?.$t('solarRevenue.cotwo.chart.seriesSavings'),
          data: [...props.coTwoSavings.values()]
            .map((v) => v | 0)
            .map(Math.abs),
        },
      ]);

      onUnmounted(() => {
        themeChangedListener();
      });

      return {
        dialog,
        options,
        series,
        amortization,
        totalCoTwoSavings,
        totalCoTwoEmission,
      };
    },
  });
</script>
