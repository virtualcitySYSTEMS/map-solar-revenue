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
};

export type SolarOptions = {
  adminOptions: AdminOptions;
  userOptions: UserOptions;
  globalSettings: GlobalSettings;
  vcSolarOptions: VcSolarOptions;
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
  },
  globalSettings: {
    isVcSolar: false,
    solarLayerName: 'SolarBuildings',
    isDebug: false,
  },
  vcSolarOptions: {
    efficiency: 20,
    costs: 1200,
    degradation: 0.5,
    kwpPerArea: 0.215,
  },
});
