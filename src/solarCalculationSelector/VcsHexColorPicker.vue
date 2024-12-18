<template>
  <VcsTextField
    v-model="colorHex"
    maxlength="7"
    :rules="[validateHexColorRule]"
  >
    <template #append-inner>
      <v-menu
        :close-on-content-click="false"
        persistent
        v-model="isMenuOpen"
        :absolute="true"
        width="300"
      >
        <template #activator="{ props }">
          <v-card rounded v-bind="props" class="dynamic-card">
            <v-sheet :color="colorHex" width="100%" height="100%" />
            <v-tooltip
              v-if="tooltip"
              location="bottom"
              activator="parent"
              :text="tooltip"
            />
          </v-card>
        </template>
        <VcsFormSection
          :heading="name"
          :header-actions="[
            {
              name: 'close',
              title: 'components.close',
              icon: 'mdi-close-thick',
              callback: () => {
                close();
              },
            },
          ]"
        >
          <v-color-picker v-model="colorHex" hide-inputs mode="hex" />
        </VcsFormSection>
      </v-menu>
    </template>
  </VcsTextField>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, PropType, ref } from 'vue';
  import { VcsFormSection, VcsTextField } from '@vcmap/ui';
  import {
    VSheet,
    VMenu,
    VCard,
    VColorPicker,
    VTooltip,
  } from 'vuetify/components';

  const internalProps = defineProps({
    name: {
      required: true,
      type: String,
    },
    tooltip: {
      type: String,
      default: undefined,
    },
    modelValue: {
      type: String as PropType<string | undefined>,
      required: true,
    },
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const vm = getCurrentInstance()?.proxy;
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const isMenuOpen = ref(false);

  const validateHexColor = (value: string): boolean => {
    return hexPattern.test(value);
  };

  const validateHexColorRule = (value: string): true | undefined | string => {
    return (
      validateHexColor(value) ||
      vm?.$st('solarRevenue.config.colors.hexPattern')
    );
  };

  const close = (): void => {
    isMenuOpen.value = false;
  };

  const colorHex = computed<string>({
    get: () => internalProps.modelValue ?? '#000000',
    set: (value: string) => {
      if (validateHexColor(value)) {
        emit('update:modelValue', value);
      }
    },
  });
</script>

<style scoped lang="scss">
  .dynamic-card {
    height: calc(var(--v-vcs-font-size) * 1.3);
    width: calc(var(--v-vcs-font-size) * 1.5);
  }
</style>
