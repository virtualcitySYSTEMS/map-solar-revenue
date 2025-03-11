<template>
  <v-sheet>
    <v-overlay
      :model-value="isPDFrunning"
      persistent
      opacity="0.7"
      class="d-flex justify-center align-center"
    >
      <v-icon size="x-large" color="primary">$vcsProgress</v-icon>
    </v-overlay>
    <VcsFormSection
      heading="solarRevenue.solarSelector.method"
      start-open
      expandable
      start-help-open
    >
      <template #help>
        <v-row no-gutters>
          <v-col v-if="solarOptions.globalSettings.isVcSolar">
            {{ $st('solarRevenue.solarSelector.helpMethod') }}
          </v-col>
          <v-col v-if="!solarOptions.globalSettings.isVcSolar">
            {{ $st('solarRevenue.solarSelector.helpMethodArea') }}
          </v-col>
        </v-row>
        <v-row no-gutters class="pt-2">
          <v-col v-if="solarOptions.globalSettings.isVcSolar">
            {{ $st('solarRevenue.solarSelector.helpMethod2') }}
          </v-col>
        </v-row>
      </template>
      <template #default>
        <v-container>
          <v-row no-gutters>
            <v-col
              class="font-weight-bold"
              :class="{
                'highlighted-selection-mode':
                  isHoveringVCSolar || vcSolarAction.active,
              }"
              cols="4"
              v-if="solarOptions.globalSettings.isVcSolar"
              @click="vcSolarAction.callback($event)"
              @mouseenter="isHoveringVCSolar = true"
              @mouseleave="isHoveringVCSolar = false"
            >
              {{ $st('solarRevenue.solarSelector.selectArea') }}
            </v-col>
            <v-col
              v-if="solarOptions.globalSettings.isVcSolar"
              :class="{
                'highlighted-selection-mode':
                  isHoveringVCSolar || vcSolarAction.active,
              }"
              @mouseenter="isHoveringVCSolar = true"
              @mouseleave="isHoveringVCSolar = false"
            >
              <VcsToolButton
                :active="vcSolarAction.active"
                :disabled="vcSolarAction.disabled"
                :has-update="vcSolarAction.hasUpdate"
                :icon="vcSolarAction.icon"
                @click="vcSolarAction.callback($event)"
              />
            </v-col>
            <v-col
              class="font-weight-bold"
              :class="{
                'highlighted-selection-mode':
                  isHoveringArea || solarAreaAction.active,
              }"
              cols="4"
              @click="solarAreaAction.callback($event)"
              @mouseenter="isHoveringArea = true"
              @mouseleave="isHoveringArea = false"
            >
              {{ $st('solarRevenue.solarSelector.drawArea') }}
            </v-col>
            <v-col
              :class="{
                'highlighted-selection-mode':
                  isHoveringArea || solarAreaAction.active,
              }"
              @mouseenter="isHoveringArea = true"
              @mouseleave="isHoveringArea = false"
            >
              <VcsToolButton
                :active="solarAreaAction.active"
                :disabled="solarAreaAction.disabled"
                :has-update="solarAreaAction.hasUpdate"
                :icon="solarAreaAction.icon"
                @click="solarAreaAction.callback($event)"
              />
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
          density="compact"
          :no-data-text="$st('solarRevenue.solarSelector.noSelection')"
          :items-per-page="itemsPerPage"
        >
          <template
            v-for="(header, index) in headers"
            :key="index"
            #[`header.${header.key}`]
          >
            <span>
              {{ $st(header.title) }}
              <v-tooltip
                location="bottom"
                v-if="header.toolTip !== undefined"
                activator="parent"
                :text="header.toolTip"
              />
            </span>
          </template>
          <template #item="{ item }">
            <tr
              @click="selectRow(item)"
              :class="{
                'highlighted-row':
                  item.featureId === selectedSolarModule?.featureId,
              }"
            >
              <td>
                <VcsFormattedNumber
                  class="px-0"
                  id="formattedNumber"
                  :model-value="item.area"
                  unit="m²"
                  :fraction-digits="2"
                />
              </td>
              <td>
                <VcsFormattedNumber
                  class="px-0"
                  id="formattedNumber"
                  :model-value="(item.solarIrradiation * item.efficiency) / 100"
                  unit="kWh/a"
                  :fraction-digits="0"
                />
              </td>
              <td>
                <v-progress-linear
                  :model-value="item.calculatedProgress.progress"
                  :color="primary"
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
                  :overflow-count="2"
                />
              </td>
            </tr>
          </template>
          <template #body.append>
            <tr class="font-weight-bold text-primary">
              <td>
                <VcsFormattedNumber
                  class="px-0"
                  id="formattedNumber"
                  :model-value="sumValues(selectedModules.map((a) => a.area))"
                  unit="m²"
                  :fraction-digits="2"
                />
              </td>
              <td>
                <VcsFormattedNumber
                  class="px-0"
                  id="formattedNumber"
                  :model-value="
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
              <td></td>
              <td>{{ $st('solarRevenue.solarSelector.total') }}</td>
            </tr>
          </template>
        </vcs-data-table>
        <v-divider />
        <v-row no-gutters>
          <v-col class="py-3 justify-center d-flex">
            <vcs-form-button
              small
              @click="calculateSolarIrradiation()"
              :loading="calculateLoading"
              :disabled="isCalculate"
            >
              {{ $st('solarRevenue.solarSelector.calculate') }}
            </vcs-form-button>
          </v-col>
        </v-row>
      </template>
    </VcsFormSection>
    <VcsFormSection
      heading="solarRevenue.solarSelector.consumptionData"
      help-text="solarRevenue.solarSelector.consumptionDataHelp"
      start-open
      expandable
    >
      <template #default>
        <v-container>
          <SolarRevenue
            ref="solarRevenueRef"
            v-model:is-storage-consumption="isStorageConsumption"
            v-model:is-finance="isFinance"
            v-model:solar-options="solarOptions"
            :credit-amount="creditAmount"
            :investment-costs="investmentCosts"
            :help-start-year="solarOptions.adminOptions.helpPriceIncreaseStart"
            :help-end-year="solarOptions.adminOptions.helpPriceIncreaseEnd"
            :help-increase="
              solarOptions.adminOptions.helpPriceIncreasePercentage
            "
          />
        </v-container>
      </template>
    </VcsFormSection>
    <VcsFormSection
      heading="solarRevenue.solarSelector.results"
      start-open
      expandable
    >
      <template #default>
        <v-container>
          <v-row
            no-gutters
            :class="{ 'highlighted-result': hasSelectedModules }"
            @click="hasSelectedModules && (profitabilityResultDialog = true)"
          >
            <v-col class="d-flex justify-start align-center">
              <VcsLabel class="pl-0">
                {{ $st('solarRevenue.solarSelector.revenueCalculation') }}
              </VcsLabel>
            </v-col>
            <v-col class="d-flex justify-end align-center">
              <ProfitabilityResult
                ref="profitabilityResultRef"
                :maintenance-costs="maintenanceCosts"
                :grid-consumption-price="gridConsumptionPrice"
                :repayment-rate="repaymentRate"
                :interest-amount="interestAmount"
                :grid-supply-price="gridSupplyPrice"
                :direct-consumption-price="directConsumptionPrice"
                :storage-consumption-price="storageConsumptionPrice"
                :liquidity="liquidity"
                :is-finance="isFinance"
                :has-selected-modules="hasSelectedModules"
                :life-time="solarOptions.adminOptions.amortizationPeriod"
                :color-options="solarOptions.colors"
                v-model:dialog="profitabilityResultDialog"
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            :class="{ 'highlighted-result': hasSelectedModules }"
            @click="hasSelectedModules && (financeResultDialog = true)"
          >
            <v-col class="d-flex justify-start align-center">
              <VcsLabel class="pl-0">
                {{ $st('solarRevenue.solarSelector.finance') }}
              </VcsLabel>
            </v-col>
            <v-col class="d-flex justify-end align-center">
              <FinanceResult
                ref="financeResultRef"
                :credit-amount="creditAmount"
                :credit-interest="solarOptions.userOptions.creditInterest"
                :credit-period="solarOptions.userOptions.creditPeriod"
                :is-finance="isFinance"
                :annuity="annuity"
                :interest-amount="interestAmount"
                :remaining-dept="remainingDept"
                :repayment-rate="repaymentRate"
                :has-selected-modules="hasSelectedModules"
                :items-per-page="itemsPerPage"
                v-model:dialog="financeResultDialog"
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            :class="{ 'highlighted-result': hasSelectedModules }"
            @click="hasSelectedModules && (coTwoResultDialog = true)"
          >
            <v-col class="d-flex justify-start align-center">
              <VcsLabel class="pl-0">
                {{ $st('solarRevenue.solarSelector.coTwoSavings') }}
              </VcsLabel>
            </v-col>
            <v-col class="d-flex justify-end align-center">
              <CoTwoResult
                ref="coTwoSavingsRef"
                :co-two-savings="coTwoSavings"
                :co-two-costs="coTwoCosts"
                :has-selected-modules="hasSelectedModules"
                :german-power-mix-year="
                  solarOptions.adminOptions.germanPowerMixYear
                "
                :color-options="solarOptions.colors"
                v-model:dialog="coTwoResultDialog"
              />
            </v-col>
          </v-row>
          <v-row
            no-gutters
            :class="{ 'highlighted-result': hasSelectedModules }"
            @click="hasSelectedModules && (keyDataResultDialog = true)"
          >
            <v-col class="d-flex justify-start align-center">
              <VcsLabel class="pl-0">
                {{ $st('solarRevenue.solarSelector.keyData') }}
              </VcsLabel>
            </v-col>
            <v-col class="d-flex justify-end align-center">
              <KeyDataResult
                ref="keyDataRef"
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
                :items-per-page="itemsPerPage"
                :is-paginated="solarOptions.globalSettings.isPaginated"
                :maintenance-portion="
                  solarOptions.adminOptions.maintenancePortion
                "
                v-model:dialog="keyDataResultDialog"
              />
            </v-col>
          </v-row>
          <v-divider />
          <v-row no-gutters class="pt-2">
            <v-col class="d-flex justify-end">
              <VcsFormButton
                variant="filled"
                @click="createPDF()"
                :disabled="selectedModules.length === 0"
              >
                {{ $st('solarRevenue.solarSelector.exportPdf') }}
              </VcsFormButton>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </VcsFormSection>
  </v-sheet>
</template>

<script setup lang="ts">
  import {
    getColorByKey,
    NotificationType,
    VcsActionButtonList,
    VcsDataTable,
    VcsFormattedNumber,
    VcsFormButton,
    VcsFormSection,
    VcsLabel,
    VcsToolButton,
    VcsUiApp,
  } from '@vcmap/ui';
  import {
    VContainer,
    VCol,
    VRow,
    VSheet,
    VProgressLinear,
    VTooltip,
    VDivider,
    VOverlay,
    VIcon,
  } from 'vuetify/components';

  import { computed, getCurrentInstance, inject, ref, watch } from 'vue';
  import { VectorLayer } from '@vcmap/core';
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
  import {
    calculateSolarAreaModules,
    highlightSelectedAreaModule,
  } from '../revenueCalculator/areaSelector/areaSelector.js';
  import { SolarModule } from '../solarInputTypes.js';
  import generatePDF from '../generatePDF.js';

  export type Header = {
    title: string;
    key?: string;
    sortable?: boolean;
    toolTip?: string;
  };

  const headers: Header[] = [
    {
      title: 'solarRevenue.solarSelector.table.area',
      key: 'area',
      toolTip: '[m²]',
    },
    {
      title: 'solarRevenue.solarSelector.table.yield',
      key: 'solarIrradiation',
      toolTip: '[kWh/a]',
    },
    {
      title: 'solarRevenue.solarSelector.table.calculated',
      sortable: false,
      toolTip: '[%]',
    },
    {
      title: 'solarRevenue.solarSelector.table.actions',
      key: 'actions',
      sortable: false,
    },
  ];

  const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
  const vm = getCurrentInstance();
  const primary = computed(() => getColorByKey(app, 'primary'));
  const solarPlugin = app.plugins.getByKey(name) as SolarPlugin;
  const { selectedSolarModule } = solarPlugin;
  const { solarAreaAction } = solarPlugin;
  const { vcSolarAction } = solarPlugin;
  const { selectedModules } = solarPlugin;
  const { vcSolarInteraction } = solarPlugin;
  const solarOptions = ref(
    JSON.parse(JSON.stringify(solarPlugin.config)) as SolarOptions,
  );
  const isPDFrunning = ref(false);
  const isFinance = ref(true);
  const isStorageConsumption = ref(true);
  const hasSelectedModules = computed(() => selectedModules.value.length > 0);
  const calculateLoading = ref(false);
  const isHoveringVCSolar = ref(false);
  const isHoveringArea = ref(false);

  const defaultStrategy = new DefaultRevenueStrategy(
    selectedModules,
    solarOptions,
  );
  const solarContext = new RevenueStrategyContext(defaultStrategy);

  const coTwoResultDialog = ref(false);
  const financeResultDialog = ref(false);
  const keyDataResultDialog = ref(false);
  const profitabilityResultDialog = ref(false);

  const itemsPerPage = computed(() => {
    if (solarOptions.value.globalSettings.isPaginated) {
      return solarOptions.value.globalSettings.itemsPerPage;
    } else {
      return Number.MAX_VALUE;
    }
  });

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

  const selectRow = (selectFeature: SolarModule): void => {
    if (selectedSolarModule.value?.featureId === selectFeature.featureId) {
      selectedSolarModule.value = null;
    } else {
      selectedSolarModule.value = selectFeature;
    }
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
    return solarContext.investmentCosts({
      isStorageConsumption: isStorageConsumption.value,
    });
  });
  const creditAmount = computed(() => {
    return solarContext.creditAmount({
      isStorageConsumption: isStorageConsumption.value,
    });
  });
  const annuity = computed(() => {
    return solarContext.annuity({
      isFinance: isFinance.value,
      isStorageConsumption: isStorageConsumption.value,
    });
  });
  const remainingDept = computed(() => {
    return solarContext.remainingDept({
      isFinance: isFinance.value,
      isStorageConsumption: isStorageConsumption.value,
    });
  });
  const repaymentRate = computed(() => {
    return solarContext.repaymentRate({
      isFinance: isFinance.value,
      isStorageConsumption: isStorageConsumption.value,
    });
  });
  const interestAmount = computed(() => {
    return solarContext.interestAmount({
      isFinance: isFinance.value,
      isStorageConsumption: isStorageConsumption.value,
    });
  });
  const maintenanceCosts = computed(() => {
    return solarContext.maintenanceCosts({
      isStorageConsumption: isStorageConsumption.value,
    });
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

  const isCalculate = computed(() => {
    return !selectedModules.value.some(
      (selectedModule) => selectedModule.type === 'area',
    );
  });

  const solarAreaLayer = app.layers.getByKey('_solarAreaLayer') as VectorLayer;

  const keyDataRef = ref();
  const coTwoSavingsRef = ref();
  const profitabilityResultRef = ref();
  const financeResultRef = ref();
  const solarRevenueRef = ref();

  const createPDF = async (): Promise<void> => {
    await generatePDF(
      app,
      selectedModules.value,
      solarOptions.value,
      isFinance.value,
      financeResultRef.value.localFinance,
      financeResultRef.value.headers,
      creditAmount.value,
      financeResultRef.value.creditCosts,
      investmentCosts.value,
      keyDataRef.value.localEnergyBalance,
      keyDataRef.value.energyHeaders,
      keyDataRef.value.localEnergyPriceBalance,
      keyDataRef.value.energyPriceHeaders,
      vm,
      coTwoSavingsRef.value.totalCoTwoSavings,
      coTwoSavingsRef.value.amortization,
      profitabilityResultRef.value.revenueOptions,
      profitabilityResultRef.value.liquidityOptions,
      solarRevenueRef.value.isHeatPump,
      solarRevenueRef.value.isCar,
      solarRevenueRef.value.selectedConsumptionProfile,
      isStorageConsumption.value,
      solarAreaLayer,
      vcSolarInteraction,
      isPDFrunning,
    );
  };

  watch(
    () => solarOptions.value.userOptions.directConsumptionPortion,
    () => adaptStorageConsumptionPortion(),
  );
  watch(
    () => solarOptions.value.userOptions.storageConsumptionPortion,
    () => adaptDirectConsumptionPortion(),
  );
  watch(
    () => selectedSolarModule.value,
    () => {
      if (selectedSolarModule.value !== null) {
        highlightSelectedAreaModule(
          selectedSolarModule.value.featureId,
          selectedModules.value,
          solarAreaLayer,
        );
        vcSolarInteraction.highlightSelectedFeature(
          selectedSolarModule.value.featureId,
        );
      } else {
        vcSolarInteraction.highlightFeatures();
        solarAreaLayer.featureVisibility.clearHighlighting();
      }
    },
  );
</script>

<style lang="scss" scoped>
  .d-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .vcs-tool-button-wrapper :deep(.v-btn__overlay) {
    --v-hover-opacity: 0.1 !important;
  }

  .vcs-data-table .v-table__wrapper table tbody tr:not(.highlighted-row):hover {
    background-color: rgb(var(--v-theme-base-lighten-3)) !important;
    cursor: pointer;
  }

  .vcs-data-table .v-table__wrapper table tbody tr.highlighted-row {
    background-color: rgb(var(--v-theme-base-lighten-1)) !important;
    cursor: pointer;
  }

  .vcs-data-table .v-table__wrapper table tbody tr:last-child {
    background-color: transparent !important;
    cursor: default !important;
  }

  .vcs-data-table .v-table__wrapper table tbody tr:last-child:hover {
    background-color: transparent !important;
  }

  .v-row.highlighted-result {
    &:hover {
      color: rgb(var(--v-theme-primary)) !important;
      cursor: pointer !important;
    }
  }

  .highlighted-selection-mode {
    color: rgb(var(--v-theme-primary)) !important;
    cursor: pointer !important;
    :deep(.v-btn__overlay) {
      background-color: rgb(var(--v-theme-base-lighten-1)) !important;
      opacity: 0.1 !important;
    }
  }
</style>
