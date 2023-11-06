<template>
  <v-container>
    <v-row class="pb-2">
      <v-col>
        {{ $t('solarRevenue.profitability.selectFeature')}}
      </v-col>
    </v-row>
    <v-divider />
    <p class="pt-2">Max</p>
    <v-divider />
  </v-container>
</template>

<script>
import { name } from '../package.json';
import { VContainer, VRow, VCol, VDivider } from 'vuetify/lib';

export default {
  name: "SolarFeatureSelector",
  components: {
    VContainer,
    VRow,
    VCol,
    VDivider
  },
  setup(){
    const app = inject('vcsApp');
    const plugin = app.plugins.getByKey(name);

  }
}
</script>

<style scoped>

</style>
