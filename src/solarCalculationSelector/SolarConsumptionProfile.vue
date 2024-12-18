<template>
  <VcsFormSection
    :heading="$st('solarRevenue.config.profile.sectionTitle')"
    expandable
    :start-open="true"
  >
    <v-row no-gutters>
      <v-col cols="6" />
      <v-col cols="3">
        <VcsLabel> {{ $st('solarRevenue.config.profile.direct') }}</VcsLabel>
      </v-col>
      <v-col cols="3">
        <VcsLabel> {{ $st('solarRevenue.config.profile.storage') }}</VcsLabel>
      </v-col>
    </v-row>
    <v-divider />
    <v-row
      no-gutters
      v-for="consumptionKey in consumptionKeys"
      :key="consumptionKey"
    >
      <v-col cols="6">
        <VcsLabel>
          {{ $st(consumptionRefs[consumptionKey].title) }}
        </VcsLabel>
      </v-col>
      <v-col cols="3">
        <VcsTextField
          v-model.number="consumptionRefs[consumptionKey].direct"
          type="number"
          hide-spin-buttons
        />
      </v-col>
      <v-col cols="3">
        <VcsTextField
          v-model.number="consumptionRefs[consumptionKey].storage"
          type="number"
          hide-spin-buttons
        />
      </v-col>
    </v-row>
  </VcsFormSection>
</template>

<script setup lang="ts">
  import { VcsFormSection, VcsLabel, VcsTextField } from '@vcmap/ui';
  import { PropType, ref, watch } from 'vue';
  import { VRow, VCol, VDivider } from 'vuetify/components';
  import { ConsumptionProfile, ConsumptionProfiles } from '../solarOptions.js';

  const innerProps = defineProps({
    modelValue: {
      type: Object as PropType<ConsumptionProfiles>,
      required: true,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const consumptionKeys = Object.keys(
    innerProps.modelValue,
  ) as readonly (keyof ConsumptionProfiles)[];

  type ConsumptionKey = (typeof consumptionKeys)[number];

  const consumptionRefs = ref<Record<ConsumptionKey, ConsumptionProfile>>(
    Object.fromEntries(
      consumptionKeys.map((key) => [
        key,
        {
          direct: innerProps.modelValue[key].direct,
          storage: innerProps.modelValue[key].storage,
          title: innerProps.modelValue[key].title,
        },
      ]),
    ) as Record<ConsumptionKey, ConsumptionProfile>,
  );

  watch(
    consumptionRefs.value,
    (newConsumption) => {
      emit('update:modelValue', newConsumption);
    },
    { deep: true },
  );
</script>

<style scoped lang="scss"></style>
