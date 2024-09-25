<template>
  <v-dialog v-model="dialog" width="500px">
    <template #activator="{ props }">
      <v-row no-gutters>
        <v-col class="d-flex justify-center">
          <vcs-form-button v-bind="props" small>
            {{ $t('solarRevenue.revenue.button') }}</vcs-form-button
          >
        </v-col>
      </v-row>
    </template>
    <v-card>
      <v-container class="pt-1">
        <h3 class="d-flex align-center px-0 py-3">
          <v-icon class="mr-1 text-primary" size="16">mdi-finance</v-icon>
          <span
            class="d-inline-block user-select-none font-weight-bold text-primary"
          >
            {{ $t('solarRevenue.revenue.title') }}
          </span>
        </h3>
        <VcsWizard v-model.number="currentStep">
          <VcsWizardStep
            :step="stepOrder.DEMAND"
            editable
            help-text="solarRevenue.revenue.help.demand"
            heading="solarRevenue.revenue.demand.title"
            v-model.number="currentStep"
          >
            <template #default>
              <v-container>
                <v-row no-gutters>
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.demand.person')
                    }}</VcsLabel>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <v-container class="px-1 pt-9">
                      <VcsSlider
                        :max="4"
                        :min="1"
                        :step="1"
                        show-ticks="always"
                        thumb-label="always"
                        :thumb-size="8"
                        v-model="solarOptions.userOptions.numberOfPersons"
                      />
                    </v-container>
                  </v-col>
                </v-row>
                <v-row no-gutters class="align-center">
                  <v-col>
                    <VcsCheckbox
                      v-model="isHeatPump"
                      label="solarRevenue.revenue.demand.isHeatPump"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters v-if="isHeatPump">
                  <v-col class="pl-10">
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.demand.livingSpace')
                    }}</VcsLabel>
                  </v-col>
                  <v-col>
                    <VcsTextField
                      type="number"
                      v-model.number="solarOptions.userOptions.livingSpace"
                      unit="m²"
                      show-spin-buttons
                      step="5"
                      :decimals="0"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <VcsCheckbox
                      v-model="isCar"
                      label="solarRevenue.revenue.demand.isCar"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters v-if="isCar">
                  <v-col class="pl-10">
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.demand.distance')
                    }}</VcsLabel>
                  </v-col>
                  <v-col>
                    <VcsTextField
                      :disabled="!isCar"
                      type="number"
                      v-model.number="
                        solarOptions.userOptions.annualDrivingDistance
                      "
                      unit="km"
                      show-spin-buttons
                      step="1000"
                      :decimals="0"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <VcsLabel class="font-weight-bold">{{
                      $t('solarRevenue.revenue.demand.demand')
                    }}</VcsLabel>
                  </v-col>
                  <v-col>
                    <VcsTextField
                      type="number"
                      v-model.number="
                        solarOptions.userOptions.electricityDemand
                      "
                      :unit="
                        $t('solarRevenue.revenue.demand.demandUnit').toString()
                      "
                    />
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </VcsWizardStep>
          <VcsWizardStep
            :step="stepOrder.CONSUMPTION"
            editable
            help-text="solarRevenue.revenue.help.consumption"
            heading="solarRevenue.revenue.consumption.title"
            v-model.number="currentStep"
          >
            <template #default>
              <v-container class="px-1 py-0">
                <v-row no-gutters class="align-center">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.consumption.directConsumption')
                    }}</VcsLabel>
                  </v-col>
                </v-row>
                <v-row no-gutters class="align-center">
                  <v-col cols="10">
                    <VcsSlider
                      :max="100"
                      :min="0"
                      type="number"
                      step="1"
                      v-model="
                        solarOptions.userOptions.directConsumptionPortion
                      "
                    />
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="
                        solarOptions.userOptions.directConsumptionPortion
                      "
                      unit="%"
                      :fraction-digits="0"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <VcsCheckbox
                      v-model="isStorageConsumption"
                      label="solarRevenue.revenue.consumption.isStorageConsumption"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.consumption.storageConsumption')
                    }}</VcsLabel>
                  </v-col>
                </v-row>
                <v-row no-gutters class="align-center">
                  <v-col cols="10">
                    <VcsSlider
                      :disabled="!isStorageConsumption"
                      :max="100"
                      :min="0"
                      type="number"
                      step="1"
                      v-model="
                        solarOptions.userOptions.storageConsumptionPortion
                      "
                    />
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="
                        solarOptions.userOptions.storageConsumptionPortion
                      "
                      unit="%"
                      :fraction-digits="0"
                    />
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </VcsWizardStep>
          <VcsWizardStep
            :step="stepOrder.COSTS"
            editable
            help-text="solarRevenue.revenue.help.costs"
            heading="solarRevenue.revenue.costs.title"
            v-model.number="currentStep"
          >
            <template #default>
              <v-container class="px-1 py-0">
                <v-row no-gutters class="align-center">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.costs.consumption')
                    }}</VcsLabel>
                  </v-col>
                  <v-col>
                    <VcsTextField
                      type="number"
                      v-model.number="
                        solarOptions.userOptions.gridPurchaseCosts
                      "
                      unit="€"
                      show-spin-buttons
                      step="0.01"
                      :decimals="2"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters class="align-center">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.costs.supply')
                    }}</VcsLabel>
                  </v-col>
                  <v-col>
                    <VcsTextField
                      type="number"
                      v-model.number="solarOptions.userOptions.feedInTariff"
                      unit="€"
                      show-spin-buttons
                      step="0.001"
                      :decimals="3"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <VcsCheckbox
                      v-model="isPriceIncrease"
                      label="solarRevenue.revenue.costs.isIncrease"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters class="align-center" v-if="isPriceIncrease">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.costs.increase')
                    }}</VcsLabel>
                  </v-col>
                  <v-col>
                    <VcsTextField
                      type="number"
                      v-model.number="
                        solarOptions.userOptions.electricityPriceIncrease
                      "
                      unit="%"
                      show-spin-buttons
                      step="0.1"
                      :decimals="1"
                    />
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </VcsWizardStep>
          <VcsWizardStep
            :step="stepOrder.FINANCE"
            editable
            help-text="solarRevenue.revenue.help.finance"
            heading="solarRevenue.revenue.finance.title"
            v-model.number="currentStep"
          >
            <template #default>
              <v-container class="px-1 py-0">
                <v-row no-gutters class="align-center">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.finance.isFinance')
                    }}</VcsLabel>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <v-switch v-model="isFinance" hide-details class="ma-0" />
                  </v-col>
                </v-row>
                <v-row no-gutters class="align-center font-weight-bold">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.finance.invest')
                    }}</VcsLabel>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="investmentCosts"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </v-col>
                </v-row>
                <v-container class="px-0 py-0" v-if="isFinance">
                  <v-row no-gutters class="align-center font-weight-bold">
                    <v-col>
                      <VcsLabel>{{
                        $t('solarRevenue.revenue.finance.credit')
                      }}</VcsLabel>
                    </v-col>
                    <v-col class="d-flex justify-end">
                      <VcsFormattedNumber
                        id="formattedNumber"
                        :model-value="creditAmount"
                        unit="€"
                        :fraction-digits="2"
                      />
                    </v-col>
                  </v-row>
                  <v-divider />
                  <v-row no-gutters class="align-center pt-2">
                    <v-col>
                      <VcsLabel>{{
                        $t('solarRevenue.revenue.finance.equity')
                      }}</VcsLabel>
                    </v-col>
                    <v-col>
                      <VcsTextField
                        type="number"
                        v-model.number="solarOptions.userOptions.equityCapital"
                        unit="€"
                        show-spin-buttons
                        :rules="[creditRule]"
                        :step="500"
                        :decimals="0"
                      />
                    </v-col>
                  </v-row>
                  <v-row no-gutters class="align-center">
                    <v-col>
                      <VcsLabel>{{
                        $t('solarRevenue.revenue.finance.duration')
                      }}</VcsLabel>
                    </v-col>
                    <v-col>
                      <VcsTextField
                        type="number"
                        v-model.number="solarOptions.userOptions.creditPeriod"
                        :unit="
                          $t(
                            'solarRevenue.revenue.finance.durationUnit',
                          ).toString()
                        "
                        show-spin-buttons
                        :max="40"
                        :min="1"
                        :step="1"
                        :decimals="0"
                      />
                    </v-col>
                  </v-row>
                  <v-row no-gutters class="align-center">
                    <v-col>
                      <VcsLabel>{{
                        $t('solarRevenue.revenue.finance.interest')
                      }}</VcsLabel>
                    </v-col>
                    <v-col>
                      <VcsTextField
                        type="number"
                        v-model.number="solarOptions.userOptions.creditInterest"
                        unit="%"
                        show-spin-buttons
                        :max="30"
                        :min="0"
                        :step="0.1"
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-container>
            </template>
          </VcsWizardStep>
        </VcsWizard>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { PropType, Ref, ref, watch } from 'vue';
  import {
    VDialog,
    VRow,
    VCard,
    VContainer,
    VCol,
    VDivider,
    VSwitch,
    VIcon,
  } from 'vuetify/components';
  import {
    VcsCheckbox,
    VcsFormattedNumber,
    VcsFormButton,
    VcsLabel,
    VcsSlider,
    VcsTextField,
    VcsWizard,
    VcsWizardStep,
  } from '@vcmap/ui';
  import type { SolarOptions } from '../solarOptions';

  const innerProps = defineProps({
    investmentCosts: {
      type: Number as PropType<number>,
      required: true,
    },
    creditAmount: {
      type: Number as PropType<number>,
      required: true,
    },
  });

  const solarOptions = defineModel('solarOptions', {
    type: Object as PropType<SolarOptions>,
    required: true,
  });

  const isFinance = defineModel('isFinance', {
    type: Boolean as PropType<boolean>,
    required: true,
  });

  const isStorageConsumption = defineModel('isStorageConsumption', {
    type: Boolean as PropType<boolean>,
    required: true,
  });

  const isHeatPump: Ref<boolean> = ref(false);
  const isCar: Ref<boolean> = ref(false);
  const isPriceIncrease: Ref<boolean> = ref(true);
  const dialog: Ref<boolean> = ref(false);
  const stepOrder = {
    DEMAND: 1,
    CONSUMPTION: 2,
    COSTS: 3,
    FINANCE: 4,
  };

  const currentStep: Ref<number> = ref(stepOrder.DEMAND);

  const calculatedElectricityDemand = (): void => {
    solarOptions.value.userOptions.electricityDemand =
      solarOptions.value.userOptions.numberOfPersons *
      solarOptions.value.adminOptions.electricityDemandPerPerson;
    if (isHeatPump.value) {
      solarOptions.value.userOptions.electricityDemand +=
        solarOptions.value.userOptions.livingSpace *
        solarOptions.value.adminOptions.electricityDemandHeatPump;
    }
    if (isCar.value) {
      solarOptions.value.userOptions.electricityDemand +=
        (solarOptions.value.userOptions.annualDrivingDistance *
          solarOptions.value.adminOptions.electricityDemandCar) /
        100;
    }
  };
  calculatedElectricityDemand();

  const creditRule = (v: number): boolean | string => {
    return (
      (v < innerProps.investmentCosts && v > 0) ||
      'Eigenkapital darf die Investitionskosten nicht übersteigen'
    );
  };

  watch(
    () => solarOptions.value.userOptions.numberOfPersons,
    () => calculatedElectricityDemand(),
  );
  watch(
    () => solarOptions.value.userOptions.livingSpace,
    () => calculatedElectricityDemand(),
  );
  watch(
    () => solarOptions.value.userOptions.annualDrivingDistance,
    () => calculatedElectricityDemand(),
  );
  watch(isHeatPump, () => calculatedElectricityDemand());
  watch(isCar, () => calculatedElectricityDemand());
</script>
