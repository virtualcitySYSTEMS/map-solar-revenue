import RevenueStrategyInterface from './revenueStrategyInterface.js';

export default class RevenueStrategyContext {
  _revenueStrategy: RevenueStrategyInterface<unknown, unknown>;

  constructor(revenueStrategy: RevenueStrategyInterface<unknown, unknown>) {
    this._revenueStrategy = revenueStrategy;
  }

  solarPowerYield(props?: unknown): Map<number, number> {
    return this._revenueStrategy.solarPowerYield(props);
  }

  coTwoSavings(props?: unknown): Map<number, number> {
    return this._revenueStrategy.coTwoSavings(props);
  }

  coTwoCosts(props?: unknown): Map<number, number> {
    return this._revenueStrategy.coTwoCosts(props);
  }

  electricityDemand(props?: unknown): Map<number, number> {
    return this._revenueStrategy.electricityDemand(props);
  }

  directConsumption(props?: unknown): Map<number, number> {
    return this._revenueStrategy.directConsumption(props);
  }

  investmentCosts(props?: unknown): number {
    return this._revenueStrategy.investmentCosts(props);
  }

  creditAmount(props?: unknown): number {
    return this._revenueStrategy.creditAmount(props);
  }

  gridPurchasePrice(props?: unknown): Map<number, number> {
    return this._revenueStrategy.gridConsumptionPrice(props);
  }

  annuity(props?: unknown): Map<number, number> {
    return this._revenueStrategy.annuity(props);
  }

  remainingDept(props?: unknown): Map<number, number> {
    return this._revenueStrategy.remainingDept(props);
  }

  repaymentRate(props?: unknown): Map<number, number> {
    return this._revenueStrategy.repaymentRate(props);
  }

  interestAmount(props?: unknown): Map<number, number> {
    return this._revenueStrategy.interestAmount(props);
  }

  storageLosses(props?: unknown): Map<number, number> {
    return this._revenueStrategy.storageLosses(props);
  }

  storageConsumption(props?: unknown): Map<number, number> {
    return this._revenueStrategy.storageConsumption(props);
  }

  gridConsumption(props?: unknown): Map<number, number> {
    return this._revenueStrategy.gridConsumption(props);
  }

  gridSupply(props?: unknown): Map<number, number> {
    return this._revenueStrategy.gridSupply(props);
  }

  gridSupplyPrice(props?: unknown): Map<number, number> {
    return this._revenueStrategy.gridSupplyPrice(props);
  }

  maintenanceCosts(props?: unknown): Map<number, number> {
    return this._revenueStrategy.maintenanceCosts(props);
  }

  gridConsumptionPrice(props?: unknown): Map<number, number> {
    return this._revenueStrategy.gridConsumptionPrice(props);
  }

  directConsumptionPrice(props?: unknown): Map<number, number> {
    return this._revenueStrategy.directConsumptionPrice(props);
  }

  storageConsumptionPrice(props?: unknown): Map<number, number> {
    return this._revenueStrategy.storageConsumptionPrice(props);
  }

  liquidity(props?: unknown): Map<number, number> {
    return this._revenueStrategy.liquidity(props);
  }
}
