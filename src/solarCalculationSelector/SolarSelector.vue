<template>
  <v-sheet>
    <VcsFormSection
      heading="solarRevenue.solarSelector.method"
      start-open
      expandable
    >
      <template #default>
        <v-container>
          <v-row no-gutters class="pb-2">
            <v-col v-if="solarOptions.globalSettings.isVcSolar">
              {{ $t('solarRevenue.solarSelector.helpMethod') }}
            </v-col>
            <v-col v-if="!solarOptions.globalSettings.isVcSolar">
              {{ $t('solarRevenue.solarSelector.helpMethodArea') }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col
              class="font-weight-bold"
              cols="4"
              v-if="solarOptions.globalSettings.isVcSolar"
            >
              {{ $t('solarRevenue.solarSelector.selectArea') }}
            </v-col>
            <v-col v-if="solarOptions.globalSettings.isVcSolar">
              <v-icon>mdi-home-roof</v-icon>
            </v-col>
            <v-col class="font-weight-bold" cols="4">
              {{ $t('solarRevenue.solarSelector.drawArea') }}
            </v-col>
            <v-col>
              <v-icon>mdi-view-grid-plus-outline</v-icon>
            </v-col>
          </v-row>
          <v-row no-gutters class="pt-2">
            <v-col v-if="solarOptions.globalSettings.isVcSolar">
              {{ $t('solarRevenue.solarSelector.helpMethod2') }}
            </v-col>
          </v-row>
        </v-container>
      </template>
    </VcsFormSection>
    <VcsFormSection
      heading="solarRevenue.solarSelector.modulesList"
      :header-actions="tableHeaderActions"
      help-text="solarRevenue.solarSelector.helpModulesList"
      start-open
      expandable
    >
      <template #default>
        <vcs-data-table
          :items="selectedModules"
          item-key="featureId"
          :show-select="false"
          :single-select="false"
          :show-searchbar="false"
          :headers="headers"
          :no-data-text="$t('solarRevenue.solarSelector.finance')"
        >
          <template
            v-for="(h, index) in headers"
            #[`header.${h.value}`]="{ header }"
          >
            <v-tooltip bottom v-if="header.toolTip !== undefined" :key="index">
              <template #activator="{ on }">
                <span v-on="on">{{ header.text }}</span>
              </template>
              <span>{{ header.toolTip }}</span>
            </v-tooltip>
            <span v-else :key="index">{{ header.text }}</span>
          </template>
          <template #item="{ item }">
            <tr>
              <td>{{ item.featureId }}</td>
              <td>
                <VcsFormattedNumber
                  id="formattedNumber"
                  :value="item.area"
                  unit="m²"
                  :fraction-digits="2"
                />
              </td>
              <td>
                <VcsFormattedNumber
                  id="formattedNumber"
                  :value="(item.solarIrradiation * item.efficiency) / 100"
                  unit="kWh/a"
                  :fraction-digits="0"
                />
              </td>
              <td>
                <v-progress-linear
                  v-model="item.calculatedProgress.progress"
                  color="primary"
                  height="15"
                >
                  <template #default="{ value }">
                    {{ Math.ceil(value) }}%
                  </template>
                </v-progress-linear>
              </td>
              <td>
                <VcsActionButtonList
                  v-if="item.actions"
                  :actions="item.actions"
                  :block-overflow="true"
                  :overflow-count="2"
                />
              </td>
            </tr>
          </template>
          <template #body.append>
            <tr class="font-weight-bold text--primary">
              <td>{{ $t('solarRevenue.solarSelector.total') }}</td>
              <td>
                <VcsFormattedNumber
                  id="formattedNumber"
                  :value="sumValues(selectedModules.map((a) => a.area))"
                  unit="m²"
                  :fraction-digits="2"
                />
              </td>
              <td>
                <VcsFormattedNumber
                  id="formattedNumber"
                  :value="
                    sumValues(
                      selectedModules.map(
                        (a) => (a.solarIrradiation * a.efficiency) / 100,
                      ),
                    )
                  "
                  unit="kWh/a"
                  :fraction-digits="0"
                />
              </td>
            </tr>
          </template>
        </vcs-data-table>
      </template>
    </VcsFormSection>
    <v-row no-gutters>
      <v-col class="py-3 justify-center d-flex">
        <vcs-form-button
          small
          @click="calculateSolarIrradiation()"
          :loading="calculateLoading"
        >
          {{ $t('solarRevenue.solarSelector.calculate') }}
        </vcs-form-button>
      </v-col>
    </v-row>
    <!-- hier calculate-->
    <VcsFormSection
      heading="solarRevenue.solarSelector.results"
      help-text="solarRevenue.solarSelector.helpResults"
      start-open
      expandable
    >
      <template #default>
        <v-container>
          <SolarRevenue
            :is-storage-consumption="isStorageConsumption"
            :is-finance="isFinance"
            :solar-options="solarOptions"
            :credit-amount="creditAmount"
            :investment-costs="investmentCosts"
            :selected-modules="selectedModules"
            @update-solar-options="(newValue) => (solarOptions = newValue)"
            @update-isFinance="(newValue) => (isFinance = newValue)"
            @update-isStorageConsumption="
              (newValue) => (isStorageConsumption = newValue)
            "
          />
          <v-row no-gutters>
            <v-col>
              <VcsLabel html-for="selectInput" :dense="true">
                {{
                  $t('solarRevenue.solarSelector.revenueCalculation')
                }}</VcsLabel
              >
            </v-col>
            <v-col class="d-flex justify-end">
              <ProfitabilityResult
                :maintenance-costs="maintenanceCosts"
                :grid-consumption-price="gridConsumptionPrice"
                :repayment-rate="repaymentRate"
                :interest-amount="interestAmount"
                :grid-supply-price="gridSupplyPrice"
                :direct-consumption-price="directConsumptionPrice"
                :storage-consumption-price="storageConsumptionPrice"
                :chart-theme="chartTheme"
                :liquidity="liquidity"
                :is-finance="isFinance"
                :has-selected-modules="hasSelectedModules"
                :life-time="solarOptions.adminOptions.amortizationPeriod"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <VcsLabel html-for="selectInput" :dense="true">
                {{ $t('solarRevenue.solarSelector.finance') }}
              </VcsLabel>
            </v-col>
            <v-col class="d-flex justify-end">
              <FinanceResult
                :credit-amount="creditAmount"
                :credit-interest="solarOptions.userOptions.creditInterest"
                :credit-period="solarOptions.userOptions.creditPeriod"
                :is-finance="isFinance"
                :annuity="annuity"
                :interest-amount="interestAmount"
                :remaining-dept="remainingDept"
                :repayment-rate="repaymentRate"
                :has-selected-modules="hasSelectedModules"
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <VcsLabel html-for="selectInput" :dense="true">
                {{ $t('solarRevenue.solarSelector.coTwoSavings') }}
              </VcsLabel>
            </v-col>
            <v-col class="d-flex justify-end">
              <CoTwoResult
                :chart-theme="chartTheme"
                :co-two-savings="coTwoSavings"
                :co-two-costs="coTwoCosts"
                :has-selected-modules="hasSelectedModules"
                :german-power-mix-year="
                  solarOptions.adminOptions.germanPowerMixYear
                "
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <VcsLabel html-for="selectInput" :dense="true">
                {{ $t('solarRevenue.solarSelector.keyData') }}
              </VcsLabel>
            </v-col>
            <v-col class="d-flex justify-end">
              <KeyDataResult
                :co-two-savings="coTwoSavings"
                :solar-power-yield="solarPowerYield"
                :electricity-demand="electricityDemand"
                :storage-losses="storageLosses"
                :direct-consumption="directConsumption"
                :storage-consumption="storageConsumption"
                :grid-consumption="gridConsumption"
                :grid-supply="gridSupply"
                :has-selected-modules="hasSelectedModules"
                :maintenance-costs="maintenanceCosts"
                :grid-consumption-price="gridConsumptionPrice"
                :direct-consumption-price="directConsumptionPrice"
                :storage-consumption-price="storageConsumptionPrice"
                :grid-supply-price="gridSupplyPrice"
                :liquidity="liquidity"
              />
            </v-col>
          </v-row>
        </v-container>
      </template>
    </VcsFormSection>
  </v-sheet>
</template>

<script lang="ts">
  import {
    getColorByKey,
    NotificationType,
    VcsActionButtonList,
    VcsDataTable,
    VcsFormattedNumber,
    VcsFormButton,
    VcsFormSection,
    VcsLabel,
    VcsUiApp,
  } from '@vcmap/ui';
  import {
    VContainer,
    VCol,
    VIcon,
    VRow,
    VSheet,
    VTooltip,
    VProgressLinear,
  } from 'vuetify/lib';
  import { computed, defineComponent, inject, ref, watch } from 'vue';
  import type { SolarCalculationType } from './solarSelector';
  import SolarRevenue from '../revenueCalculator/SolarRevenue.vue';
  import CoTwoResult from '../revenueCalculator/resultComponents/CoTwoResult.vue';
  import ProfitabilityResult from '../revenueCalculator/resultComponents/ProfitabilityResult.vue';
  import FinanceResult from '../revenueCalculator/resultComponents/FincanceResult.vue';
  import KeyDataResult from '../revenueCalculator/resultComponents/KeyDataResult.vue';
  import DefaultRevenueStrategy from '../revenueCalculator/defaultRevenueStrategy.js';
  import RevenueStrategyContext from '../revenueCalculator/revenueStrategyContext.js';
  import type { SolarPlugin } from '../index.js';
  import { name } from '../../package.json';
  import { sumValues } from '../helper.js';
  import { SolarOptions } from '../solarOptions.js';
  import { calculateSolarAreaModules } from '../revenueCalculator/areaSelector/areaSelector.js';

  const defaultHeaders = [
    {
      text: 'solarRevenue.solarSelector.table.id',
      value: 'featureId',
    },
    {
      text: 'solarRevenue.solarSelector.table.area',
      value: 'area',
      toolTip: '[m²]',
    },
    {
      text: 'solarRevenue.solarSelector.table.yield',
      value: 'solarIrradiation',
      toolTip: '[kWh/a]',
    },
    {
      text: 'solarRevenue.solarSelector.table.calculated',
      sortable: false,
      toolTip: '[%]',
    },
    {
      text: 'solarRevenue.solarSelector.table.actions',
      value: 'actions',
      sortable: false,
    },
  ];

  export default defineComponent({
    name: 'SolarSelector',
    methods: { sumValues },
    components: {
      KeyDataResult,
      FinanceResult,
      ProfitabilityResult,
      CoTwoResult,
      SolarRevenue,
      VContainer,
      VIcon,
      VcsDataTable,
      VSheet,
      VcsFormSection,
      VcsLabel,
      VRow,
      VCol,
      VcsActionButtonList,
      VTooltip,
      VProgressLinear,
      VcsFormButton,
      VcsFormattedNumber,
    },
    setup() {
      const primary = ref(getColorByKey('primary'));
      const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
      const solarPlugin = app.plugins.getByKey(name) as SolarPlugin;
      const { selectedModules } = solarPlugin;
      const { chartTheme } = solarPlugin;
      const { vcSolarInteraction } = solarPlugin;
      const solarOptions = ref(
        JSON.parse(JSON.stringify(solarPlugin.config)) as SolarOptions,
      );
      const solarCalculationType = ref<SolarCalculationType>('vcsolar');
      const headers = defaultHeaders;
      const isFinance = ref(true);
      const isStorageConsumption = ref(true);
      const hasSelectedModules = computed(
        () => selectedModules.value.length > 0,
      );
      const calculateLoading = ref(false);

      const defaultStrategy = new DefaultRevenueStrategy(
        selectedModules,
        solarOptions,
      );
      const solarContext = new RevenueStrategyContext(defaultStrategy);

      const calculateSolarIrradiation = async (): Promise<void> => {
        calculateLoading.value = true;
        try {
          await calculateSolarAreaModules(
            selectedModules.value,
            app,
            solarOptions.value.globalSettings.isDebug,
          );
        } catch (err) {
          app.notifier.add({
            type: NotificationType.WARNING,
            message: 'solarRevenue.nasa',
          });
        }

        calculateLoading.value = false;
      };

      const coTwoSavings = computed(() => {
        return solarContext.coTwoSavings();
      });

      const coTwoCosts = computed(() => {
        return solarContext.coTwoCosts();
      });
      const solarPowerYield = computed(() => {
        return solarContext.solarPowerYield();
      });

      const directConsumptionPrice = computed(() => {
        return solarContext.directConsumptionPrice();
      });

      const storageConsumptionPrice = computed(() => {
        return solarContext.storageConsumptionPrice({
          isStorageConsumption: isStorageConsumption.value,
        });
      });
      const storageLosses = computed(() => {
        return solarContext.storageLosses({
          isStorageConsumption: isStorageConsumption.value,
        });
      });
      const directConsumption = computed(() => {
        return solarContext.directConsumption();
      });
      const storageConsumption = computed(() => {
        return solarContext.storageConsumption({
          isStorageConsumption: isStorageConsumption.value,
        });
      });
      const gridConsumption = computed(() => {
        return solarContext.gridConsumption({
          isStorageConsumption: isStorageConsumption.value,
        });
      });
      const gridSupply = computed(() => {
        return solarContext.gridSupply({
          isStorageConsumption: isStorageConsumption.value,
        });
      });
      const gridSupplyPrice = computed(() => {
        return solarContext.gridSupplyPrice({
          isStorageConsumption: isStorageConsumption.value,
        });
      });
      const electricityDemand = computed(() => {
        return solarContext.electricityDemand();
      });
      const investmentCosts = computed(() => {
        return solarContext.investmentCosts();
      });
      const creditAmount = computed(() => {
        return solarContext.creditAmount();
      });
      const annuity = computed(() => {
        return solarContext.annuity({ isFinance: isFinance.value });
      });
      const remainingDept = computed(() => {
        return solarContext.remainingDept({ isFinance: isFinance.value });
      });
      const repaymentRate = computed(() => {
        return solarContext.repaymentRate({ isFinance: isFinance.value });
      });
      const interestAmount = computed(() => {
        return solarContext.interestAmount({ isFinance: isFinance.value });
      });
      const maintenanceCosts = computed(() => {
        return solarContext.maintenanceCosts();
      });
      const gridConsumptionPrice = computed(() => {
        return solarContext.gridConsumptionPrice({
          isStorageConsumption: isStorageConsumption.value,
        });
      });
      const liquidity = computed(() => {
        return solarContext.liquidity({
          isStorageConsumption: isStorageConsumption.value,
          isFinance: isFinance.value,
        });
      });

      const tableHeaderActions = [
        {
          name: 'clearSelectedModules',
          icon: 'mdi-home-remove-outline',
          title: 'solarRevenue.solarSelector.selection',
          callback(): void {
            vcSolarInteraction?.clear();
          },
        },
      ];

      const adaptStorageConsumptionPortion = (): void => {
        if (
          solarOptions.value.userOptions.directConsumptionPortion +
            solarOptions.value.userOptions.storageConsumptionPortion >
          100
        ) {
          solarOptions.value.userOptions.storageConsumptionPortion =
            100 - solarOptions.value.userOptions.directConsumptionPortion;
        }
      };
      const adaptDirectConsumptionPortion = (): void => {
        if (
          solarOptions.value.userOptions.directConsumptionPortion +
            solarOptions.value.userOptions.storageConsumptionPortion >
          100
        ) {
          solarOptions.value.userOptions.directConsumptionPortion =
            100 - solarOptions.value.userOptions.storageConsumptionPortion;
        }
      };

      watch(
        () => solarOptions.value.userOptions.directConsumptionPortion,
        () => adaptStorageConsumptionPortion(),
      );
      watch(
        () => solarOptions.value.userOptions.storageConsumptionPortion,
        () => adaptDirectConsumptionPortion(),
      );

      return {
        primary,
        solarCalculationType,
        selectedModules,
        headers,
        tableHeaderActions,
        solarContext,
        coTwoSavings,
        coTwoCosts,
        electricityDemand,
        solarOptions,
        investmentCosts,
        creditAmount,
        annuity,
        remainingDept,
        repaymentRate,
        interestAmount,
        isFinance,
        solarPowerYield,
        storageConsumption,
        storageLosses,
        gridConsumption,
        gridSupply,
        directConsumption,
        isStorageConsumption,
        maintenanceCosts,
        gridConsumptionPrice,
        directConsumptionPrice,
        storageConsumptionPrice,
        gridSupplyPrice,
        chartTheme,
        liquidity,
        hasSelectedModules,
        calculateSolarIrradiation,
        calculateLoading,
      };
    },
  });
</script>

<style lang="scss" scoped>
  .d-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>
