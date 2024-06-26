import { Ref } from 'vue';

export default interface RevenueStrategyInterface<T, U> {
  _selectedModules: Ref<U[]>;
  _config: Ref<T>;
  _amortizationPeriod: number;

  // annual values
  solarPowerYield(props?: unknown): Map<number, number>;
  coTwoSavings(props?: unknown): Map<number, number>;
  coTwoCosts(props?: unknown): Map<number, number>;
  electricityDemand(props?: unknown): Map<number, number>;
  directConsumption(props?: unknown): Map<number, number>;
  storageConsumption(props?: unknown): Map<number, number>;
  gridConsumptionPrice(props?: unknown): Map<number, number>;
  gridConsumption(props?: unknown): Map<number, number>;
  gridSupply(props?: unknown): Map<number, number>;
  gridSupplyPrice(props?: unknown): Map<number, number>;
  storageLosses(props?: unknown): Map<number, number>;
  maintenanceCosts(props?: unknown): Map<number, number>;
  annuity(props?: unknown): Map<number, number>;
  remainingDept(props?: unknown): Map<number, number>;
  repaymentRate(props?: unknown): Map<number, number>;
  interestAmount(props?: unknown): Map<number, number>;
  directConsumptionPrice(props?: unknown): Map<number, number>;
  storageConsumptionPrice(props?: unknown): Map<number, number>;
  liquidity(props?: unknown): Map<number, number>;

  // one-time values
  investmentCosts(props?: unknown): number;
  creditAmount(props?: unknown): number;
}
