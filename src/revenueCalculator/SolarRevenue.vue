<template>
  <v-dialog v-model="dialog" width="500px">
    <template #activator="{ on }">
      <v-row no-gutters>
        <v-col class="d-flex justify-center">
          <vcs-form-button v-on="on" small>
            {{ $t('solarRevenue.revenue.button') }}</vcs-form-button
          >
        </v-col>
      </v-row>
    </template>
    <v-card>
      <v-container class="px-5 py-1">
        <h3 class="d-flex align-center px-0 py-3">
          <v-icon class="mr-1 text--primary" size="16">mdi-finance</v-icon>
          <span
            class="d-inline-block user-select-none font-weight-bold text--primary"
          >
            {{ $t('solarRevenue.revenue.title') }}
          </span>
        </h3>
        <VcsWizard v-model.number="currentStep" class="elevation-0">
          <VcsWizardStep
            :step="stepOrder.DEMAND"
            editable
            help-text="solarRevenue.revenue.help.demand"
            heading="solarRevenue.revenue.demand.title"
            v-model.number="currentStep"
          >
            <template #content>
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
                        type="number"
                        step="1"
                        ticks="always"
                        thumb-label="always"
                        :thumb-size="24"
                        v-model="localSolarOptions.userOptions.numberOfPersons"
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
                      v-model.number="localSolarOptions.userOptions.livingSpace"
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
                        localSolarOptions.userOptions.annualDrivingDistance
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
                        localSolarOptions.userOptions.electricityDemand
                      "
                      :unit="
                        $t('solarRevenue.revenue.demand.demandUnit').toString()
                      "
                      show-spin-buttons
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
            <template #content>
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
                        localSolarOptions.userOptions.directConsumptionPortion
                      "
                    />
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :value="
                        localSolarOptions.userOptions.directConsumptionPortion
                      "
                      unit="%"
                      :fraction-digits="0"
                    />
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col>
                    <VcsCheckbox
                      v-model="localIsStorageConsumption"
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
                      :disabled="!localIsStorageConsumption"
                      :max="100"
                      :min="0"
                      type="number"
                      step="1"
                      v-model="
                        localSolarOptions.userOptions.storageConsumptionPortion
                      "
                    />
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :value="
                        localSolarOptions.userOptions.storageConsumptionPortion
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
            <template #content>
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
                        localSolarOptions.userOptions.gridPurchaseCosts
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
                      v-model.number="
                        localSolarOptions.userOptions.feedInTariff
                      "
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
                <v-row no-gutters class="align-center">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.costs.increase')
                    }}</VcsLabel>
                  </v-col>
                  <v-col>
                    <VcsTextField
                      :disabled="!isPriceIncrease"
                      type="number"
                      v-model.number="
                        localSolarOptions.userOptions.electricityPriceIncrease
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
            <template #content>
              <v-container class="px-1 py-0">
                <v-row no-gutters class="align-center">
                  <v-col>
                    <VcsLabel>{{
                      $t('solarRevenue.revenue.finance.isFinance')
                    }}</VcsLabel>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <v-switch
                      v-model="localIsFinance"
                      hide-details
                      class="ma-0"
                    />
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
                      :value="investmentCosts"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </v-col>
                </v-row>
                <v-container class="px-0 py-0" v-if="localIsFinance">
                  <v-row no-gutters class="align-center font-weight-bold">
                    <v-col>
                      <VcsLabel>{{
                        $t('solarRevenue.revenue.finance.credit')
                      }}</VcsLabel>
                    </v-col>
                    <v-col class="d-flex justify-end">
                      <VcsFormattedNumber
                        id="formattedNumber"
                        :value="creditAmount"
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
                        v-model.number="
                          localSolarOptions.userOptions.equityCapital
                        "
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
                        v-model.number="
                          localSolarOptions.userOptions.creditPeriod
                        "
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
                        v-model.number="
                          localSolarOptions.userOptions.creditInterest
                        "
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

<script lang="ts">
  import {
    computed,
    defineComponent,
    inject,
    PropType,
    Ref,
    ref,
    watch,
  } from 'vue';
  import {
    VDialog,
    VRow,
    VCard,
    VContainer,
    VCol,
    VDivider,
    VSwitch,
    VIcon,
  } from 'vuetify/lib';
  import {
    VcsCheckbox,
    VcsFormattedNumber,
    VcsFormButton,
    VcsLabel,
    VcsSlider,
    VcsTextField,
    VcsUiApp,
    VcsWizard,
    VcsWizardStep,
  } from '@vcmap/ui';
  import type { SolarOptions } from '../solarOptions';
  import { calculateSolarAreaModules } from './areaSelector/areaSelector.js';
  import { SolarModule } from '../solarInputTypes.js';

  export default defineComponent({
    name: 'SolarRevenue',
    methods: { calculateSolarAreaModules },
    components: {
      VcsSlider,
      VcsCheckbox,
      VcsLabel,
      VRow,
      VCol,
      VDialog,
      VcsFormButton,
      VCard,
      VcsWizard,
      VcsWizardStep,
      VContainer,
      VcsTextField,
      VcsFormattedNumber,
      VDivider,
      VSwitch,
      VIcon,
    },
    props: {
      solarOptions: {
        type: Object as PropType<SolarOptions>,
        required: true,
      },
      investmentCosts: {
        type: Number as PropType<number>,
        required: true,
      },
      creditAmount: {
        type: Number as PropType<number>,
        required: true,
      },
      isFinance: {
        type: Boolean as PropType<boolean>,
        required: true,
      },
      isStorageConsumption: {
        type: Boolean as PropType<boolean>,
        required: true,
      },
      selectedModules: {
        type: Array as PropType<SolarModule[]>,
        required: true,
      },
    },
    setup(props, context) {
      const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;
      const isHeatPump: Ref<boolean> = ref(false);
      const isCar: Ref<boolean> = ref(false);
      const isPriceIncrease: Ref<boolean> = ref(false);
      const dialog: Ref<boolean> = ref(false);
      const sliderValues = ref(3);

      const stepOrder = {
        DEMAND: 1,
        CONSUMPTION: 2,
        COSTS: 3,
        FINANCE: 4,
      };

      const currentStep: Ref<number> = ref(stepOrder.DEMAND);

      const localSolarOptions = computed({
        get(): SolarOptions {
          return props.solarOptions;
        },
        set(newValue: SolarOptions): void {
          context.emit('update-solar-options', newValue);
        },
      });

      const localIsFinance = computed({
        get(): boolean {
          return props.isFinance;
        },
        set(newValue: boolean): void {
          context.emit('update-isFinance', Boolean(newValue));
        },
      });

      const localIsStorageConsumption = computed({
        get(): boolean {
          return props.isStorageConsumption;
        },
        set(newValue: boolean): void {
          context.emit('update-isStorageConsumption', Boolean(newValue));
        },
      });

      const calculatedElectricityDemand = (): void => {
        localSolarOptions.value.userOptions.electricityDemand =
          localSolarOptions.value.userOptions.numberOfPersons *
          localSolarOptions.value.adminOptions.electricityDemandPerPerson;
        if (isHeatPump.value) {
          localSolarOptions.value.userOptions.electricityDemand +=
            localSolarOptions.value.userOptions.livingSpace *
            localSolarOptions.value.adminOptions.electricityDemandHeatPump;
        }
        if (isCar.value) {
          localSolarOptions.value.userOptions.electricityDemand +=
            (localSolarOptions.value.userOptions.annualDrivingDistance *
              localSolarOptions.value.adminOptions.electricityDemandCar) /
            100;
        }
      };
      calculatedElectricityDemand();

      watch(
        () => localSolarOptions.value.userOptions.numberOfPersons,
        () => calculatedElectricityDemand(),
      );
      watch(
        () => localSolarOptions.value.userOptions.livingSpace,
        () => calculatedElectricityDemand(),
      );
      watch(
        () => localSolarOptions.value.userOptions.annualDrivingDistance,
        () => calculatedElectricityDemand(),
      );
      watch(isHeatPump, () => calculatedElectricityDemand());
      watch(isCar, () => calculatedElectricityDemand());

      return {
        app,
        dialog,
        stepOrder,
        currentStep,
        isHeatPump,
        isCar,
        sliderValues,
        isPriceIncrease,
        localSolarOptions,
        localIsFinance,
        localIsStorageConsumption,
        creditRule(v: number): boolean | string {
          return (
            (v < props.investmentCosts && v > 0) ||
            'Eigenkapital darf die Investitionskosten nicht übersteigen'
          );
        },
      };
    },
  });
</script>
