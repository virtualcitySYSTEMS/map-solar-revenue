<template>
  <v-dialog v-model="dialog" width="600px">
    <template #activator="{ props }">
      <VcsButton
        icon="mdi-open-in-new"
        v-bind="props"
        :disabled="!hasSelectedModules || !isFinance"
      />
    </template>
    <v-card>
      <v-container class="px-5 py-1">
        <h3 class="d-flex align-center px-0 py-3">
          <v-icon class="mr-1 text--primary" size="16">mdi-currency-eur</v-icon>
          <span
            class="d-inline-block user-select-none font-weight-bold text--primary"
          >
            {{ $t('solarRevenue.finance.title') }}
          </span>
        </h3>
        <v-row no-gutters class="px-0 py-3">
          <v-col class="d-flex justify-center">
            <v-card
              class="my-1 elevation-0 rounded-0 borderCard"
              outlined
              width="400px"
            >
              <v-row no-gutters class="align-center font-weight-bold">
                <v-col>
                  <VcsLabel
                    >{{ $t('solarRevenue.finance.creditAmount') }}:</VcsLabel
                  >
                </v-col>
                <v-col cols="9">
                  <VcsFormattedNumber
                    id="formattedNumber"
                    :model-value="creditAmount"
                    unit="€"
                    :fraction-digits="2"
                  />
                </v-col>
              </v-row>
              <v-row no-gutters class="align-center font-weight-bold">
                <v-col>
                  <VcsLabel
                    >{{ $t('solarRevenue.finance.creditInterest') }}:</VcsLabel
                  >
                </v-col>
                <v-col cols="9">
                  <VcsLabel> {{ creditInterest }} % </VcsLabel>
                </v-col>
              </v-row>
              <v-row no-gutters class="align-center font-weight-bold">
                <v-col>
                  <VcsLabel
                    >{{ $t('solarRevenue.finance.creditPeriod') }}:</VcsLabel
                  >
                </v-col>
                <v-col cols="9">
                  {{ creditPeriod }}
                  {{ $t('solarRevenue.finance.creditPeriodUnit') }}</v-col
                >
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-3">
          <v-col class="d-flex justify-center">
            <vcs-data-table
              :items="localFinance"
              item-key="year"
              :show-select="false"
              :single-select="false"
              :show-searchbar="false"
              :headers="headers"
              v-model="localFinance"
              density="compact"
            >
              <template #item="{ item }">
                <tr>
                  <td>
                    {{ item.year }}
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.annuity"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.repaymentRate"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.remainingDept"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                  <td>
                    <VcsFormattedNumber
                      id="formattedNumber"
                      :model-value="item.interestAmount"
                      unit="€"
                      :fraction-digits="2"
                    />
                  </td>
                </tr>
              </template>
            </vcs-data-table>
          </v-col>
        </v-row>
        <v-divider />
        <v-row no-gutters class="px-0 pt-3 font-weight-bold">
          <v-col class="d-flex justify-start">
            <VcsLabel>{{ $t('solarRevenue.finance.creditTotal') }}</VcsLabel>
          </v-col>
          <v-col class="d-flex justify-end">
            <VcsLabel>
              <VcsFormattedNumber
                id="formattedNumber"
                :model-value="creditCosts"
                unit="€"
                :fraction-digits="2"
              />
            </VcsLabel>
          </v-col>
        </v-row>
        <v-row no-gutters class="px-0 py-3">
          <v-col class="d-flex text-justify">
            {{ $t('solarRevenue.finance.text') }}</v-col
          >
        </v-row>
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
  import { computed, PropType, Ref, ref } from 'vue';
  import {
    VDialog,
    VRow,
    VCard,
    VCol,
    VContainer,
    VIcon,
    VDivider,
  } from 'vuetify/components';
  import {
    VcsButton,
    VcsDataTable,
    VcsFormattedNumber,
    VcsLabel,
  } from '@vcmap/ui';

  const innerProps = defineProps({
    annuity: {
      type: Map as PropType<Map<number, number>>,
      required: true,
    },
    remainingDept: {
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
    isFinance: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    creditAmount: {
      type: Number as PropType<number>,
      required: true,
    },
    creditInterest: {
      type: Number as PropType<number>,
      required: true,
    },
    creditPeriod: {
      type: Number as PropType<number>,
      required: true,
    },
    hasSelectedModules: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  });

  const headers = [
    {
      title: 'solarRevenue.finance.header.year',
      key: 'year',
    },
    {
      title: 'solarRevenue.finance.header.annuity',
      key: 'annuity',
    },
    {
      title: 'solarRevenue.finance.header.repaymentRate',
      key: 'repaymentRate',
    },
    {
      title: 'solarRevenue.finance.header.remainingDept',
      key: 'remainingDept',
    },
    {
      title: 'solarRevenue.finance.header.interestAmount',
      key: 'interestAmount',
    },
  ];

  export type FinanceValues = {
    year: number;
    annuity: number;
    remainingDept: number;
    repaymentRate: number;
    interestAmount: number;
  };

  const dialog: Ref<boolean> = ref(false);

  const localFinance = computed(() => {
    const finance: FinanceValues[] = [];
    innerProps.annuity.forEach((v, k) => {
      finance.push({
        year: k,
        annuity: v,
        remainingDept: innerProps.remainingDept.get(k) || 0,
        repaymentRate: innerProps.repaymentRate.get(k) || 0,
        interestAmount: innerProps.interestAmount.get(k) || 0,
      });
    });
    return finance;
  });

  const creditCosts = computed(() => {
    return [...innerProps.annuity.values()].reduce((acc, val) => acc + val);
  });
</script>
