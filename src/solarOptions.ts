export type ConsumptionProfile = {
  title: string;
  direct: number;
  storage: number;
};

export type ConsumptionProfiles = {
  balanced: ConsumptionProfile;
  day: ConsumptionProfile;
  evening: ConsumptionProfile;
  high: ConsumptionProfile;
  optimal: ConsumptionProfile;
};

export type AdminOptions = {
  germanPowerMix: number;
  germanPowerMixYear: number;
  solarManufacture: number;
  electricityDemandPerPerson: number;
  electricityDemandHeatPump: number;
  electricityDemandCar: number;
  storageDegradation: number;
  storageLosses: number;
  amortizationPeriod: number;
  maintenancePortion: number;
  storageCapacityPrice: number;
  consumptionProfiles: ConsumptionProfiles;
  helpPriceIncreaseStart: number;
  helpPriceIncreaseEnd: number;
  helpPriceIncreasePercentage: number;
};

export type UserOptions = {
  numberOfPersons: number;
  livingSpace: number;
  annualDrivingDistance: number;
  directConsumptionPortion: number;
  storageConsumptionPortion: number;
  gridPurchaseCosts: number;
  feedInTariff: number;
  electricityPriceIncrease: number;
  equityCapital: number;
  creditPeriod: number;
  creditInterest: number;
  electricityDemand: number;
  storageCapacity: number;
};

export type VcSolarOptions = {
  efficiency: number;
  costs: number;
  degradation: number;
  kwpPerArea: number;
};

export type GlobalSettings = {
  isVcSolar: boolean;
  solarLayerName: string;
  isDebug: boolean;
  itemsPerPage: number;
  isPaginated: boolean;
  infoContent: string;
  startInfoOpen: boolean;
  startPluginOpen: boolean;
};

export type SolarColor = {
  light?: string;
  dark?: string;
  default: string;
};

export type SolarDiagramColors = Record<string, SolarColor>;

export type SolarColors = {
  global: SolarDiagramColors;
  liquidity: SolarDiagramColors;
  co2: SolarDiagramColors;
  revenue: SolarDiagramColors;
};

export type PDFOptions = {
  footerLineOne: string;
  footerLineTwo: string;
  primaryColor: string;
  onPrimaryColor: string;
  infoContent: string;
};

export type SolarOptions = {
  adminOptions: AdminOptions;
  userOptions: UserOptions;
  globalSettings: GlobalSettings;
  vcSolarOptions: VcSolarOptions;
  colors: SolarColors;
  pdf: PDFOptions;
};

export default (): SolarOptions => ({
  adminOptions: {
    germanPowerMix: 0.434,
    germanPowerMixYear: 2022,
    solarManufacture: 500,
    electricityDemandPerPerson: 1300,
    electricityDemandHeatPump: 35,
    electricityDemandCar: 15,
    storageDegradation: 1,
    storageLosses: 20,
    amortizationPeriod: 20,
    maintenancePortion: 2,
    storageCapacityPrice: 500,
    helpPriceIncreaseStart: 2000,
    helpPriceIncreaseEnd: 2021,
    helpPriceIncreasePercentage: 6.1,
    consumptionProfiles: {
      balanced: {
        title: 'solarRevenue.revenue.consumption.profiles.balanced',
        direct: 30,
        storage: 30,
      },
      day: {
        title: 'solarRevenue.revenue.consumption.profiles.day',
        direct: 50,
        storage: 20,
      },
      evening: {
        title: 'solarRevenue.revenue.consumption.profiles.evening',
        direct: 15,
        storage: 45,
      },
      high: {
        title: 'solarRevenue.revenue.consumption.profiles.high',
        direct: 40,
        storage: 30,
      },
      optimal: {
        title: 'solarRevenue.revenue.consumption.profiles.optimal',
        direct: 60,
        storage: 20,
      },
    },
  },
  userOptions: {
    numberOfPersons: 3,
    livingSpace: 100,
    annualDrivingDistance: 10000,
    directConsumptionPortion: 30,
    storageConsumptionPortion: 30,
    gridPurchaseCosts: 0.29,
    feedInTariff: 0.082,
    electricityPriceIncrease: 2,
    equityCapital: 3000,
    creditPeriod: 10,
    creditInterest: 4.0,
    electricityDemand: 0,
    storageCapacity: 10,
  },
  globalSettings: {
    isVcSolar: false,
    solarLayerName: 'SolarBuildings',
    isDebug: false,
    itemsPerPage: 10,
    isPaginated: true,
    infoContent: 'solarRevenue.infoContent.content',
    startInfoOpen: false,
    startPluginOpen: false,
  },
  vcSolarOptions: {
    efficiency: 20,
    costs: 1200,
    degradation: 0.5,
    kwpPerArea: 0.215,
  },
  colors: {
    global: {
      strokeColor: {
        light: '#F8F8F8',
        dark: '#383838',
        default: 'base-darken-4',
      },
    },
    revenue: {
      directConsumptionPriceColor: { default: 'primary-lighten-1' },
      storageConsumptionPriceColor: { default: 'primary-darken-1' },
      gridSupplyPriceColor: { default: 'primary-darken-2' },
      maintenanceCostsColor: {
        light: '#FFE664',
        dark: '#FFE664',
        default: 'base-darken-1',
      },
      gridConsumptionPriceColor: {
        light: '#FFD600',
        dark: '#FFD600',
        default: 'base-darken-2',
      },
      repaymentRateColor: {
        light: '#C6A600',
        dark: '#C6A600',
        default: 'base-darken-3',
      },
      interestAmountColor: {
        light: '#9B8200',
        dark: '#9B8200',
        default: 'base-darken-4',
      },
    },
    liquidity: {
      positiveLiquidityColor: { default: 'primary' },
      negativeLiquidityColor: {
        light: '#FFD600',
        dark: '#FFD600',
        default: 'base-darken-1',
      },
    },
    co2: {
      coTwoSavingsColor: { default: 'primary' },
      coTwoCostsColor: {
        light: '#FFD600',
        dark: '#FFD600',
        default: 'base-darken-1',
      },
    },
  },
  pdf: {
    footerLineOne: 'Musterstadt',
    footerLineTwo: 'Musterstraße 1, 00000 Musterstadt',
    primaryColor: 'primary',
    onPrimaryColor: 'on-primary',
    infoContent: 'solarRevenue.pdf.lastPage.infoContent',
  },
});
