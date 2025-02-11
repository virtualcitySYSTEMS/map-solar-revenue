<template>
  <v-dialog v-model="dialog" width="600" eager>
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
          <v-icon class="mr-1 text-primary" size="16">mdi-molecule-co2</v-icon>
          <span
            class="d-inline-block user-select-none font-weight-bold text-primary"
          >
            {{ $st('solarRevenue.cotwo.title') }}
          </span>
        </h3>
        <VueApexCharts
          type="bar"
          :options="options"
          :series="series"
          height="500"
          v-show="true"
        />
        <v-divider />
        <v-row no-gutters class="px-0 py-0 font-weight-bold">
          <v-col class="d-flex justify-start">
            <VcsLabel>{{ $st('solarRevenue.cotwo.totalEmission') }}</VcsLabel>
          </v-col>
          <v-col class="d-flex justify-end">
            <VcsLabel>
              <VcsFormattedNumber
                id="formattedNumber"
                :model-value="totalCoTwoEmission"
                unit="kg"
                :fraction-digits="0"
              />
            </VcsLabel>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-0 font-weight-bold">
          <v-col class="d-flex justify-start">
            <VcsLabel>{{ $st('solarRevenue.cotwo.totalSavings') }}</VcsLabel>
          </v-col>
          <v-col class="d-flex justify-end">
            <VcsLabel>
              <VcsFormattedNumber
                id="formattedNumber"
                :model-value="totalCoTwoSavings"
                unit="kg"
                :fraction-digits="0"
              />
            </VcsLabel>
          </v-col>
        </v-row>
        <v-divider />
        <v-row no-gutters class="px-1 py-1">
          <v-col class="text-justify">
            {{ $st('solarRevenue.cotwo.text1') }}
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 py-1" v-if="amortization > 0">
          <v-col class="text-justify d-flex justify-center font-weight-bold">
            {{ $st('solarRevenue.cotwo.text2') }}
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 py-1" v-if="amortization > 0">
          <v-col class="d-flex justify-center font-weight-bold text-primary">
            <VcsFormattedNumber
              id="formattedNumber"
              :model-value="amortization"
              :unit="$st('solarRevenue.cotwo.unit').toString()"
              :fraction-digits="2"
            />
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 py-1" v-if="amortization <= 0">
          <v-col class="text-justify d-flex justify-center font-weight-bold">
            {{ $st('solarRevenue.cotwo.text3') }}
          </v-col>
        </v-row>
        <v-row no-gutters class="px-1 pt-1 pb-3">
          <v-col class="text-justify">
            {{
              $st('solarRevenue.cotwo.text4', {
                germanPowerMixYear,
              })
            }}
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, inject, PropType } from 'vue';
  import {
    VCard,
    VContainer,
    VDialog,
    VIcon,
    VRow,
    VCol,
    VDivider,
  } from 'vuetify/components';
  import { VcsButton, VcsUiApp, VcsLabel, VcsFormattedNumber } from '@vcmap/ui';
  import VueApexCharts from 'vue3-apexcharts';
  import { downloadSVG, getSolarColorByKey } from '../../helper.js';
  import { SolarColors } from '../../solarOptions.js';

  const dialog = defineModel('dialog', {
    type: Boolean as PropType<boolean>,
    required: true,
  });

  const innerProps = defineProps({
    coTwoSavings: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    coTwoCosts: {
      type: Map as PropType<Map<number, number>>,
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
    colorOptions: {
      type: Object as PropType<SolarColors>,
      required: true,
    },
  });

  const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
  const vm = getCurrentInstance()?.proxy;
  const coTwoSavingsColor = computed(() =>
    getSolarColorByKey(app, innerProps.colorOptions.co2, 'coTwoSavingsColor'),
  );
  const coTwoCostsColor = computed(() =>
    getSolarColorByKey(app, innerProps.colorOptions.co2, 'coTwoCostsColor'),
  );
  const strokeColor = computed(() =>
    getSolarColorByKey(app, innerProps.colorOptions.global, 'strokeColor'),
  );

  const totalCoTwoEmission = computed(() => {
    return innerProps.coTwoCosts.size
      ? [...innerProps.coTwoCosts.values()].reduce(
          (acc: number, val: number) => {
            return acc + val;
          },
        )
      : 0;
  });
  const totalCoTwoSavings = computed(() => {
    return innerProps.coTwoSavings.size
      ? [...innerProps.coTwoSavings.values()].reduce(
          (acc: number, val: number) => {
            return acc + val;
          },
        )
      : 0;
  });

  const amortization = computed(() => {
    let amort = 0;
    innerProps.coTwoSavings.forEach((v, k) => {
      const costs = innerProps.coTwoCosts.get(k) || 0;
      if (costs !== 0 && v !== 0) {
        amort = k + costs / (costs + v) - 1;
      }
    });
    return amort;
  });

  const series = computed(() => [
    {
      name: vm?.$st('solarRevenue.cotwo.chart.seriesEmission'),
      data: [...innerProps.coTwoCosts.values()].map((v) => v | 0).map(Math.abs),
    },
    {
      name: vm?.$st('solarRevenue.cotwo.chart.seriesSavings'),
      data: [...innerProps.coTwoSavings.values()]
        .map((v) => v | 0)
        .map(Math.abs),
    },
  ]);

  const options = computed(() => {
    return {
      chart: {
        type: 'bar',
        stacked: true,
        toolbar: {
          tools: {
            download: downloadSVG,
          },
        },
        animations: {
          enabled: false,
        },
      },
      series: series.value,
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          borderRadius: 1,
          horizontal: true,
        },
      },
      colors: [coTwoCostsColor.value, coTwoSavingsColor.value],
      xaxis: {
        categories: [...innerProps.coTwoSavings.keys()],
        labels: {
          formatter(val: number): string {
            return new Intl.NumberFormat('de-DE', {
              style: 'unit',
              unit: 'kilogram',
            }).format(val);
          },
        },
      },
      yaxis: {
        labels: {
          formatter(val: string): string {
            return `${val}. ${vm
              ?.$st('solarRevenue.cotwo.chart.yUnit')
              .toString()}`;
          },
        },
      },
      tooltip: {
        y: {
          formatter(val: number): string {
            return new Intl.NumberFormat('de-DE', {
              style: 'unit',
              unit: 'kilogram',
            }).format(val);
          },
        },
      },
      theme: {
        mode: app.vuetify.theme.current.value.dark ? 'dark' : 'light',
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
        colors: [strokeColor.value],
      },
    };
  });

  defineExpose({
    totalCoTwoSavings,
    amortization,
  });
</script>
