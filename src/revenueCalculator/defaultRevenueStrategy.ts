import { Ref } from 'vue';
import type { SolarModule } from '../solarInputTypes';
import RevenueStrategyInterface from './revenueStrategyInterface.js';
import type { SolarOptions } from '../solarOptions.js';
import { roundCommercial } from '../helper.js';

function moduleDirectConsumption(
  electricityDemand: number,
  solarModule: SolarModule,
  directConsumptionPortion: number,
  year: number,
): number {
  return (
    ((electricityDemand * directConsumptionPortion) / 100) *
    (1 - (solarModule.degradation / 100) * (year - 1))
  );
}

function modulePowerYield(solarModule: SolarModule, year: number): number {
  return (
    solarModule.solarIrradiation *
    (solarModule.efficiency / 100) *
    (1 - (solarModule.degradation / 100) * (year - 1))
  );
}

function moduleCoTwoSavings(
  solarModule: SolarModule,
  year: number,
  germanPowerMix: number,
): number {
  return modulePowerYield(solarModule, year) * germanPowerMix;
}

function moduleCoTwoCosts(
  solarModule: SolarModule,
  solarManufacture: number,
): number {
  return solarModule.kwp * solarManufacture;
}

function moduleInvestmentCosts(solarModule: SolarModule): number {
  return solarModule.costs * solarModule.kwp;
}

function storageConsumptionYear(
  year: number,
  electricityDemand: number,
  storageConsumption: number,
  storageDegradation: number,
): number {
  return (
    ((electricityDemand * storageConsumption) / 100) *
    (1 - (storageDegradation / 100) * (year - 1))
  );
}

export default class DefaultRevenueStrategy
  implements RevenueStrategyInterface<SolarOptions, SolarModule>
{
  _amortizationPeriod: number;

  _config: Ref<SolarOptions>;

  _selectedModules: Ref<SolarModule[]>;

  constructor(selectedModules: Ref<SolarModule[]>, config: Ref<SolarOptions>) {
    this._config = config;
    this._selectedModules = selectedModules;
    this._amortizationPeriod = config.value.adminOptions.amortizationPeriod;
  }

  liquidity(props: {
    isStorageConsumption: boolean;
    isFinance: boolean;
  }): Map<number, number> {
    let pre = 0;
    const gridSupplyPrice = this.gridSupplyPrice(props);
    const directConsumptionPrice = this.directConsumptionPrice();
    const storageConsumptionPrice = this.storageConsumptionPrice(props);
    const maintenanceCosts = this.maintenanceCosts();
    const gridConsumptionPrice = this.gridConsumptionPrice(props);
    const repaymentRate = this.repaymentRate(props);
    const annuity = this.annuity(props);
    const liquidityMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      const einnahmen =
        (gridSupplyPrice.get(i) || 0) +
        (directConsumptionPrice.get(i) || 0) +
        (storageConsumptionPrice.get(i) || 0);

      const ausgaben =
        (maintenanceCosts.get(i) || 0) +
        (gridConsumptionPrice.get(i) || 0) +
        (repaymentRate.get(i) || 0) +
        (annuity.get(i) || 0);

      liquidityMap.set(i, pre + einnahmen - ausgaben);
      pre = einnahmen - ausgaben;
    }
    return liquidityMap;
  }

  gridSupply(props: { isStorageConsumption: boolean }): Map<number, number> {
    const solarPowerYield = this.solarPowerYield();
    const directConsumption = this.directConsumption();
    const storageConsumption = this.storageConsumption(props);
    const gridSupplyMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      gridSupplyMap.set(
        i,
        (solarPowerYield.get(i) || 0) -
          (directConsumption.get(i) || 0) -
          (storageConsumption.get(i) || 0),
      );
    }
    return gridSupplyMap;
  }

  gridConsumption(props: {
    isStorageConsumption: boolean;
  }): Map<number, number> {
    const directConsumption = this.directConsumption();
    const storageConsumption = this.storageConsumption(props);
    const gridConsumptionMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      gridConsumptionMap.set(
        i,
        this._config.value.userOptions.electricityDemand -
          (directConsumption.get(i) || 0) -
          (storageConsumption.get(i) || 0),
      );
    }
    return gridConsumptionMap;
  }

  gridSupplyPrice(props: {
    isStorageConsumption: boolean;
  }): Map<number, number> {
    const gridSupply = this.gridSupply(props);
    const gridSupplyPriceMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      gridSupplyPriceMap.set(
        i,
        (gridSupply.get(i) || 0) * this._config.value.userOptions.feedInTariff,
      );
    }
    return gridSupplyPriceMap;
  }

  gridConsumptionPrice(props: {
    isStorageConsumption: boolean;
  }): Map<number, number> {
    const gridConsumption = this.gridConsumption(props);
    const gridPurchasePriceMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      const price = roundCommercial(
        (gridConsumption.get(i) || 0) *
          this._config.value.userOptions.gridPurchaseCosts *
          (1 + this._config.value.userOptions.electricityPriceIncrease / 100) **
            (i - 1),
      );
      gridPurchasePriceMap.set(i, price);
    }
    return gridPurchasePriceMap;
  }

  storageConsumptionPrice(props: {
    isStorageConsumption: boolean;
  }): Map<number, number> {
    const storageConsumption = this.storageConsumption(props);
    const storageConsumptionPriceMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      const price = roundCommercial(
        (storageConsumption.get(i) || 0) *
          this._config.value.userOptions.gridPurchaseCosts *
          (1 + this._config.value.userOptions.electricityPriceIncrease / 100) **
            (i - 1),
      );
      storageConsumptionPriceMap.set(i, price);
    }
    return storageConsumptionPriceMap;
  }

  directConsumptionPrice(): Map<number, number> {
    const directConsumption = this.directConsumption();
    const directConsumptionPriceMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      const price = roundCommercial(
        (directConsumption.get(i) || 0) *
          this._config.value.userOptions.gridPurchaseCosts *
          (1 + this._config.value.userOptions.electricityPriceIncrease / 100) **
            (i - 1),
      );
      directConsumptionPriceMap.set(i, price);
    }
    return directConsumptionPriceMap;
  }

  creditAmount(): number {
    return (
      this.investmentCosts() - this._config.value.userOptions.equityCapital
    );
  }

  investmentCosts(): number {
    if (!this._selectedModules.value.length) {
      return 0;
    } else {
      return this._selectedModules.value
        .map((mod) => moduleInvestmentCosts(mod))
        .reduce((curr, pre) => {
          return curr + pre;
        });
    }
  }

  maintenanceCosts(): Map<number, number> {
    const maintenanceCostsMap = new Map<number, number>();
    const investmentCosts = this.investmentCosts();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      maintenanceCostsMap.set(
        i,
        (investmentCosts * this._config.value.adminOptions.maintenancePortion) /
          100,
      );
    }
    return maintenanceCostsMap;
  }

  solarPowerYield(): Map<number, number> {
    if (!this._selectedModules.value.length) {
      return new Map<number, number>();
    } else {
      const powerYieldMap: Map<number, number> = new Map();
      for (let i = 1; i <= this._amortizationPeriod; i++) {
        powerYieldMap.set(
          i,
          this._selectedModules.value
            .map((filteredModule) => modulePowerYield(filteredModule, i))
            .reduce((curr, pre) => {
              return curr + pre;
            }),
        );
      }
      return powerYieldMap;
    }
  }

  costs(): number {
    const costs = this._selectedModules.value
      .map((filteredModule) => {
        const moduleCostsInner = moduleCoTwoCosts(
          filteredModule,
          this._config.value.adminOptions.solarManufacture,
        );
        return moduleCostsInner;
      })
      .reduce((a, b) => {
        return a + b;
      });
    return costs;
  }

  savings(year: number): number {
    const savings = this._selectedModules.value
      .map((filteredModule) =>
        moduleCoTwoSavings(
          filteredModule,
          year,
          this._config.value.adminOptions.germanPowerMix,
        ),
      )
      .reduce((a, b) => {
        return a + b;
      });
    return savings;
  }

  coTwoCosts(): Map<number, number> {
    if (!this._selectedModules.value.length) {
      return new Map<number, number>();
    } else {
      const coTwoSavings = this.coTwoSavings();
      const coTwoCostsMap: Map<number, number> = new Map();
      let costs = this.costs();
      for (let i = 1; i <= this._amortizationPeriod; i++) {
        const savings = this.savings(i);
        if (savings <= costs) {
          coTwoCostsMap.set(i, savings);
        } else {
          const localcosts = savings - (coTwoSavings.get(i) || 0);
          coTwoCostsMap.set(i, localcosts);
        }
        costs = costs - savings <= 0 ? 0 : costs - savings;
      }
      return coTwoCostsMap;
    }
  }

  coTwoSavings(): Map<number, number> {
    if (!this._selectedModules.value.length) {
      return new Map<number, number>();
    } else {
      const coTwoSavingsMap: Map<number, number> = new Map();
      let costs = this.costs();
      for (let i = 1; i <= this._amortizationPeriod; i++) {
        const savings = this.savings(i);
        if (savings <= costs) {
          coTwoSavingsMap.set(i, 0);
        } else {
          coTwoSavingsMap.set(i, savings - costs);
        }
        costs = costs - savings <= 0 ? 0 : costs - savings;
      }
      return coTwoSavingsMap;
    }
  }

  electricityDemand(): Map<number, number> {
    const electricityDemandMap = new Map<number, number>();

    for (let i = 1; i <= this._amortizationPeriod; i++) {
      electricityDemandMap.set(
        i,
        this._config.value.userOptions.electricityDemand,
      );
    }
    return electricityDemandMap;
  }

  storageLosses(props: { isStorageConsumption: boolean }): Map<number, number> {
    const storageLossesMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      storageLossesMap.set(
        i,
        props.isStorageConsumption
          ? (storageConsumptionYear(
              i,
              this._config.value.userOptions.electricityDemand,
              this._config.value.userOptions.storageConsumptionPortion,
              this._config.value.adminOptions.storageDegradation,
            ) *
              this._config.value.adminOptions.storageLosses) /
              100
          : 0,
      );
    }
    return storageLossesMap;
  }

  storageConsumption(props: {
    isStorageConsumption: boolean;
  }): Map<number, number> {
    const storageConsumptionMap = new Map<number, number>();
    for (let i = 1; i <= this._amortizationPeriod; i++) {
      storageConsumptionMap.set(
        i,
        props.isStorageConsumption
          ? storageConsumptionYear(
              i,
              this._config.value.userOptions.electricityDemand,
              this._config.value.userOptions.storageConsumptionPortion,
              this._config.value.adminOptions.storageDegradation,
            )
          : 0,
      );
    }
    return storageConsumptionMap;
  }

  directConsumption(): Map<number, number> {
    if (!this._selectedModules.value.length) {
      return new Map<number, number>();
    } else {
      const directConsumptionMap = new Map<number, number>();
      for (let i = 1; i <= this._amortizationPeriod; i++) {
        directConsumptionMap.set(
          i,
          this._selectedModules.value
            .map((filteredModule) =>
              moduleDirectConsumption(
                this._config.value.userOptions.electricityDemand,
                filteredModule,
                this._config.value.userOptions.directConsumptionPortion,
                i,
              ),
            )
            .reduce((a, b) => {
              return a + b;
            }),
        );
      }
      return directConsumptionMap;
    }
  }

  annuity(props: { isFinance: boolean }): Map<number, number> {
    const annuityMap = new Map<number, number>();
    const creditAmount = this.creditAmount();
    for (let t = 1; t <= this._config.value.userOptions.creditPeriod; t++) {
      annuityMap.set(
        t,
        props.isFinance
          ? (creditAmount *
              ((this._config.value.userOptions.creditInterest / 100) *
                (1 + this._config.value.userOptions.creditInterest / 100) **
                  this._config.value.userOptions.creditPeriod)) /
              ((1 + this._config.value.userOptions.creditInterest / 100) **
                this._config.value.userOptions.creditPeriod -
                1)
          : 0,
      );
    }
    return annuityMap;
  }

  remainingDept(props: { isFinance: boolean }): Map<number, number> {
    const remainingDeptMap = new Map<number, number>();
    const creditAmount = this.creditAmount();
    for (let t = 1; t <= this._config.value.userOptions.creditPeriod; t++) {
      remainingDeptMap.set(
        t,
        props.isFinance
          ? (creditAmount *
              ((1 + this._config.value.userOptions.creditInterest / 100) **
                this._config.value.userOptions.creditPeriod -
                (1 + this._config.value.userOptions.creditInterest / 100) **
                  t)) /
              ((1 + this._config.value.userOptions.creditInterest / 100) **
                this._config.value.userOptions.creditPeriod -
                1)
          : 0,
      );
    }
    return remainingDeptMap;
  }

  repaymentRate(props: { isFinance: boolean }): Map<number, number> {
    const repaymentRateMap = new Map<number, number>();
    const creditAmount = this.creditAmount();
    for (let t = 1; t <= this._config.value.userOptions.creditPeriod; t++) {
      repaymentRateMap.set(
        t,
        props.isFinance
          ? (creditAmount *
              ((this._config.value.userOptions.creditInterest / 100) *
                (1 + this._config.value.userOptions.creditInterest / 100) **
                  (t - 1))) /
              ((1 + this._config.value.userOptions.creditInterest / 100) **
                this._config.value.userOptions.creditPeriod -
                1)
          : 0,
      );
    }
    return repaymentRateMap;
  }

  interestAmount(props: { isFinance: boolean }): Map<number, number> {
    const interestAmountMap = new Map<number, number>();
    const creditAmount = this.creditAmount();
    for (let t = 1; t <= this._config.value.userOptions.creditPeriod; t++) {
      interestAmountMap.set(
        t,
        props.isFinance
          ? (creditAmount *
              ((this._config.value.userOptions.creditInterest / 100) *
                ((1 + this._config.value.userOptions.creditInterest / 100) **
                  this._config.value.userOptions.creditPeriod -
                  (1 + this._config.value.userOptions.creditInterest / 100) **
                    (t - 1)))) /
              ((1 + this._config.value.userOptions.creditInterest / 100) **
                this._config.value.userOptions.creditPeriod -
                1)
          : 0,
      );
    }
    return interestAmountMap;
  }
}
