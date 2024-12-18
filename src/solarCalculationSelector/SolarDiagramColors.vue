<template>
  <VcsFormSection
    :heading="$st(`${nameSpace}.title`)"
    expandable
    :start-open="true"
  >
    <v-container class="py-0 px-1">
      <v-row no-gutters class="align-center justify-lg-space-between">
        <v-col cols="5" />
        <v-col>
          <VcsLabel>
            {{ $st('solarRevenue.config.colors.lightThemeTitle') }}
          </VcsLabel>
        </v-col>
        <v-col class="pl-12">
          <VcsLabel>
            {{ $st('solarRevenue.config.colors.darkThemeTitle') }}
          </VcsLabel>
        </v-col>
      </v-row>
      <v-divider />
      <v-row
        no-gutters
        v-for="colorKey in colorKeys"
        :key="colorKey"
        class="align-center justify-lg-space-between"
      >
        <v-col cols="5">
          <VcsLabel>
            {{ $st(`${nameSpace}.${colorKey}`) }}
          </VcsLabel>
        </v-col>
        <v-col class="d-flex align-center">
          <VcsHexColorPicker v-model="colorsRefs[colorKey].light" name="name" />
          <v-tooltip
            location="top"
            :text="$st('solarRevenue.config.colors.sync')"
          >
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                icon="mdi-arrow-right-bold"
                class="px-6"
                @click="syncColors(colorsRefs[colorKey])"
              />
            </template>
          </v-tooltip>
          <VcsHexColorPicker v-model="colorsRefs[colorKey].dark" name="name" />
        </v-col>
      </v-row>
    </v-container>
  </VcsFormSection>
</template>

<script setup lang="ts">
  import { ref, watch, inject, PropType } from 'vue';
  import { VcsFormSection, VcsLabel, VcsUiApp } from '@vcmap/ui';
  import {
    VCol,
    VRow,
    VIcon,
    VTooltip,
    VContainer,
    VDivider,
  } from 'vuetify/components';
  import VcsHexColorPicker from './VcsHexColorPicker.vue';
  import { SolarColor, SolarDiagramColors } from '../solarOptions.js';

  const innerProps = defineProps({
    modelValue: {
      type: Object as PropType<SolarDiagramColors>,
      required: true,
    },
    nameSpace: {
      type: String as PropType<string>,
      required: true,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const app: VcsUiApp = inject<VcsUiApp>('vcsApp')!;

  const colorKeys = Object.keys(
    innerProps.modelValue,
  ) as readonly (keyof SolarDiagramColors)[];

  type SolarColorKey = (typeof colorKeys)[number];

  const syncColors = (solarColor: SolarColor): void => {
    solarColor.dark = solarColor.light;
  };

  const colorsRefs = ref<Record<SolarColorKey, SolarColor>>(
    Object.fromEntries(
      colorKeys.map((key) => [
        key,
        {
          light:
            innerProps.modelValue[key].light ??
            app.vuetify.theme.computedThemes.value.light.colors[
              innerProps.modelValue[key].default
            ],
          dark:
            innerProps.modelValue[key]?.dark ??
            app.vuetify.theme.computedThemes.value.dark.colors[
              innerProps.modelValue[key].default
            ],
        },
      ]),
    ) as Record<SolarColorKey, SolarColor>,
  );

  watch(
    colorsRefs,
    (newColors) => {
      emit('update:modelValue', newColors);
    },
    { deep: true },
  );
</script>
