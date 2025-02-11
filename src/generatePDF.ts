import { jsPDF, jsPDFOptions } from 'jspdf';
import { VcsUiApp } from '@vcmap/ui';
import autoTable from 'jspdf-autotable';
import { ComponentInternalInstance, Ref } from 'vue';
import { ApexOptions } from 'apexcharts';
import { VectorLayer } from '@vcmap/core';
import { TITILIUMWEB_BOLD, TITILIUMWEB_REGULAR } from './assets/titiliumweb.js';
import { CO2, ENERGY_REVENUE, EURO, VCS_LOGO_PNG } from './assets/images.js';
import {
  EnergyBalance,
  EnergyPriceBalance,
} from './revenueCalculator/resultComponents/KeyDataResult.vue';
import { Header } from './solarCalculationSelector/SolarSelector.vue';
import { ConsumptionProfile, SolarOptions } from './solarOptions.js';
import { FinanceValues } from './revenueCalculator/resultComponents/FincanceResult.vue';
import { SolarModule } from './solarInputTypes.js';
import { sumValues } from './helper.js';
import {
  createApexChartImageString,
  createScreenShots,
  dynamicTextSize,
  formatterTwoDigits,
  formatterZeroDigits,
  getBooleanString,
  getCapaString,
  getCarString,
  getConsumptionProfileString,
  getCreditString,
  getDurationString,
  getEquityString,
  getInterestString,
  getLivingSpaceString,
  getStorageString,
  recolorTransparentImageAsync,
  transText,
} from './pdfHelper.js';
import VcSolarInteraction from './solarCalculationSelector/vcSolarInteraction.js';

export default async function generatePDF(
  app: VcsUiApp,
  selectedModules: SolarModule[],
  solarOptions: SolarOptions,
  isFinance: boolean,
  finance: FinanceValues[],
  financeHeader: Header[],
  creditAmount: number,
  creditCosts: number,
  investmentCosts: number,
  energyBalance: EnergyBalance[],
  energyBalanceHeader: Header[],
  energyPriceBalance: EnergyPriceBalance[],
  energyPriceBalanceHeader: Header[],
  vm: ComponentInternalInstance | null,
  totalCoTwoSavings: number,
  co2Amortization: number,
  revenueChartOptions: ApexOptions,
  liquidityChartOptions: ApexOptions,
  isHeatPump: boolean,
  isCar: boolean,
  selectedConsumptionProfile: ConsumptionProfile | null,
  isStorageConsumption: boolean,
  solarAreaLayer: VectorLayer,
  vcSolarInteraction: VcSolarInteraction,
  isRunning: Ref<boolean>,
): Promise<void> {
  isRunning.value = true;
  const options: jsPDFOptions = {
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
  };

  await createScreenShots(
    app,
    selectedModules,
    solarAreaLayer,
    vcSolarInteraction,
  );
  const primaryColor =
    solarOptions.pdf.primaryColor === 'primary'
      ? app.vuetify.theme.computedThemes.value.light.colors.primary
      : solarOptions.pdf.primaryColor;
  const onPrimaryColor =
    solarOptions.pdf.onPrimaryColor === 'on-primary'
      ? app.vuetify.theme.computedThemes.value.light.colors['on-primary']
      : solarOptions.pdf.onPrimaryColor;
  const black = '#000000';
  const grey = '#EBEBEB';
  const darkGrey = '#888888';
  const darkGrey2 = '#5E5E5E';
  const yellow = '#FFD600';

  const localEnergyBalanceHeader: string[] = energyBalanceHeader.map(
    (item: Header) => transText(vm, item.title) ?? '1',
  );

  const localEnergyPriceBalanceHeader: string[] = energyPriceBalanceHeader.map(
    (item: Header) => transText(vm, item.title) ?? '1',
  );

  const localFinanceHeader: string[] = financeHeader.map(
    (item: Header) => transText(vm, item.title) ?? '1',
  );

  const localEnergyBalance = energyBalance.map((i): string[] => [
    formatterZeroDigits.format(i.year),
    `${formatterZeroDigits.format(i.solarPowerYield)} kWh`,
    `${formatterZeroDigits.format(i.electricityDemand)} kWh`,
    `${formatterZeroDigits.format(i.storageLosses)} kWh`,
    `${formatterZeroDigits.format(i.directConsumption)} kWh`,
    `${formatterZeroDigits.format(i.storageConsumption)} kWh`,
    `${formatterZeroDigits.format(i.gridConsumption)} kWh`,
    `${formatterZeroDigits.format(i.gridSupply)} kWh`,
  ]);

  const localEnergyPriceBalance = energyPriceBalance.map((i): string[] => [
    formatterZeroDigits.format(i.year),
    `${formatterTwoDigits.format(i.maintenanceCosts)} €`,
    `${formatterTwoDigits.format(i.gridConsumptionPrice)} €`,
    `${formatterTwoDigits.format(i.directConsumptionPrice)} €`,
    `${formatterTwoDigits.format(i.storageConsumptionPrice)} €`,
    `${formatterTwoDigits.format(i.gridSupplyPrice)} €`,
    `${formatterTwoDigits.format(i.liquidity)} €`,
  ]);

  const localFinance = finance.map((i): string[] => [
    formatterZeroDigits.format(i.year),
    `${formatterTwoDigits.format(i.annuity)} €`,
    `${formatterTwoDigits.format(i.repaymentRate)} €`,
    `${formatterTwoDigits.format(i.remainingDept)} €`,
    `${formatterTwoDigits.format(i.interestAmount)} €`,
  ]);

  const localEnergyBalanceFooter = [
    transText(vm, 'solarRevenue.pdf.general.totalTable'),
    ...Object.entries(energyBalance[0])
      .filter(([key]) => key !== 'year')
      .map(([key]) => {
        const sum: number = energyBalance.reduce(
          (interSum: number, item) =>
            interSum + (item[key as keyof EnergyBalance] as number),
          0,
        );
        return `${formatterZeroDigits.format(sum)} kWh`;
      }),
  ];

  const localEnergyPriceBalanceFooter = [
    transText(vm, 'solarRevenue.pdf.general.totalTable'),
    ...Object.entries(energyPriceBalance[0])
      .filter(([key]) => key !== 'year' && key !== 'liquidity')
      .map(([key]) => {
        const sum: number = energyPriceBalance.reduce(
          (interSum: number, item) =>
            interSum + (item[key as keyof EnergyPriceBalance] as number),
          0,
        );
        return `${formatterTwoDigits.format(sum)} €`;
      }),
    '',
  ];

  const sumDirectConsumption: number = energyPriceBalance.reduce(
    (interSum: number, item: EnergyPriceBalance): number =>
      (interSum + item.directConsumptionPrice) as number,
    0,
  );

  const sumStorageConsumption: number = energyPriceBalance.reduce(
    (interSum: number, item: EnergyPriceBalance): number =>
      (interSum + item.storageConsumptionPrice) as number,
    0,
  );

  const sumGridSupplyPrice: number = energyPriceBalance.reduce(
    (interSum: number, item: EnergyPriceBalance): number =>
      (interSum + item.gridSupplyPrice) as number,
    0,
  );

  const sumMaintenanceCosts: number = energyPriceBalance.reduce(
    (interSum: number, item: EnergyPriceBalance): number =>
      (interSum + item.maintenanceCosts) as number,
    0,
  );

  const sumInterestAmount: number = finance.reduce(
    (interSum: number, item: FinanceValues): number =>
      (interSum + item.interestAmount) as number,
    0,
  );

  const totalArea = sumValues(selectedModules.map((a) => a.area));

  const yearlyMaintenanceCosts: number = energyPriceBalance[0].maintenanceCosts;

  const yearlyAnnuity: number = finance[0].annuity;

  const localFinanceFooter = [
    transText(vm, 'solarRevenue.pdf.result.financeFooter'),
    '',
    '',
    '',
    `${formatterTwoDigits.format(creditCosts)} €`,
  ];

  const energyImageString = await recolorTransparentImageAsync(
    ENERGY_REVENUE,
    onPrimaryColor,
  );
  const euroImageString = await recolorTransparentImageAsync(
    EURO,
    onPrimaryColor,
  );
  const co2ImageString = await recolorTransparentImageAsync(
    CO2,
    onPrimaryColor,
  );
  const lastPageImageString = await recolorTransparentImageAsync(
    VCS_LOGO_PNG,
    primaryColor,
  );
  const firstPageImageString = await recolorTransparentImageAsync(
    VCS_LOGO_PNG,
    onPrimaryColor,
  );

  const currentDate = new Intl.DateTimeFormat(app.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  // eslint-disable-next-line new-cap
  const doc = new jsPDF(options);
  // global
  doc.setFillColor(primaryColor);
  doc.addFileToVFS('TitilliumWeb-Regular.ttf', TITILIUMWEB_REGULAR);
  doc.addFont('TitilliumWeb-Regular.ttf', 'Titillium Web', 'normal');
  doc.addFileToVFS('TitilliumWeb-Bold.ttf', TITILIUMWEB_BOLD);
  doc.addFont('TitilliumWeb-Bold.ttf', 'Titillium Web', 'bold');

  // first page
  doc.rect(0, 0, 210, 200, 'F');
  doc.addImage(
    firstPageImageString,
    'png',
    15,
    15,
    195,
    112,
    undefined,
    'FAST',
  );
  doc.setFont('Titillium Web', 'bold');
  doc.setTextColor(onPrimaryColor);
  doc.setFontSize(80);
  doc.text(
    transText(vm, 'solarRevenue.pdf.titlePage.title').toUpperCase(),
    20,
    190,
  );
  doc.setTextColor(darkGrey2);
  doc.setFontSize(45);
  doc.text(transText(vm, 'solarRevenue.pdf.titlePage.subTitle1'), 20, 220);
  doc.text(transText(vm, 'solarRevenue.pdf.titlePage.subTitle2'), 20, 240);
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 250, 50, 250);
  doc.setFont('Titillium Web', 'normal');
  doc.setTextColor(134, 134, 134);
  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text(currentDate, 20, 265);

  // overview
  doc.addPage();
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFillColor(primaryColor);
  doc.rect(0, 90, 210, 70, 'F');
  doc.setTextColor(primaryColor);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setFontSize(48);
  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.title'), 20, 80);
  doc.addImage(energyImageString, 'png', 20, 95, 30, 26.25, undefined, 'FAST');
  doc.addImage(euroImageString, 'png', 90, 95, 30, 26.25, undefined, 'FAST');
  doc.addImage(co2ImageString, 'png', 160, 95, 30, 26.25, undefined, 'FAST');
  doc.setTextColor(onPrimaryColor);
  dynamicTextSize(localEnergyBalanceFooter[1], 20, 135, 45, 20, doc);
  dynamicTextSize(
    `${formatterTwoDigits.format(
      sumDirectConsumption +
        sumStorageConsumption +
        sumGridSupplyPrice -
        sumMaintenanceCosts -
        investmentCosts -
        sumInterestAmount,
    )} €`,
    90,
    135,
    45,
    20,
    doc,
  );
  dynamicTextSize(
    `${formatterZeroDigits.format(totalCoTwoSavings)} kg`,
    160,
    135,
    45,
    20,
    doc,
  );
  doc.setDrawColor(onPrimaryColor);
  doc.setLineWidth(1);
  doc.line(20, 140, 40, 140);
  doc.line(90, 140, 110, 140);
  doc.line(160, 140, 180, 140);
  doc.setFontSize(16);
  doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.totalEnergy'), 20, 150);
  doc.text(
    transText(vm, 'solarRevenue.pdf.overviewPage.totalSavings'),
    90,
    150,
  );
  doc.text(
    transText(vm, 'solarRevenue.pdf.overviewPage.coTwoSavings'),
    160,
    150,
  );
  doc.setTextColor(primaryColor);
  doc.setFontSize(12);
  doc.setFont('Titillium Web', 'normal');
  doc.text(
    transText(vm, 'solarRevenue.pdf.overviewPage.period', {
      period: solarOptions.adminOptions.amortizationPeriod,
    }),
    20,
    170,
  );
  doc.setTextColor(black);

  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.gainKey'), 75, 190, {
    align: 'right',
  });
  doc.text(
    transText(vm, 'solarRevenue.pdf.overviewPage.gainText1', {
      value: `${formatterTwoDigits.format(sumGridSupplyPrice)} €`,
    }),
    80,
    190,
  );
  doc.setFont('Titillium Web', 'normal');
  doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.gainText2'), 80, 195);
  doc.setFont('Titillium Web', 'bold');
  doc.text(
    transText(vm, 'solarRevenue.pdf.overviewPage.gainText3', {
      value: `${formatterTwoDigits.format(
        sumDirectConsumption + sumStorageConsumption,
      )} €`,
    }),
    80,
    205,
  );
  doc.setFont('Titillium Web', 'normal');
  doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.gainText4'), 80, 210);

  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.investKey'), 75, 220, {
    align: 'right',
  });
  doc.text(
    transText(vm, 'solarRevenue.pdf.overviewPage.investText1', {
      value: `${formatterTwoDigits.format(investmentCosts)} €`,
    }),
    80,
    220,
  );
  doc.setFont('Titillium Web', 'normal');
  doc.text(
    transText(vm, 'solarRevenue.pdf.overviewPage.investText2', {
      value: `${formatterTwoDigits.format(yearlyMaintenanceCosts)} €`,
    }),
    80,
    225,
  );
  doc.setFont('Titillium Web', 'bold');
  if (isFinance) {
    doc.text(
      transText(vm, 'solarRevenue.pdf.overviewPage.investText3', {
        value: `${formatterTwoDigits.format(creditCosts)} €`,
        value2: `${formatterTwoDigits.format(sumInterestAmount)} €`,
      }),
      80,
      235,
    );
    doc.setFont('Titillium Web', 'normal');
    doc.text(
      transText(vm, 'solarRevenue.pdf.overviewPage.investText4', {
        value: `${formatterTwoDigits.format(creditAmount)} €`,
      }),
      80,
      240,
    );
    doc.text(
      transText(vm, 'solarRevenue.pdf.overviewPage.investText5', {
        value: `${formatterTwoDigits.format(yearlyAnnuity)} €`,
      }),
      80,
      245,
    );
    doc.setFont('Titillium Web', 'bold');
    doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.areaKey'), 75, 255, {
      align: 'right',
    });
    doc.text(
      transText(vm, 'solarRevenue.pdf.overviewPage.areaText', {
        value: `${formatterTwoDigits.format(totalArea)} m²`,
      }),
      80,
      255,
    );
  } else {
    doc.setFont('Titillium Web', 'bold');
    doc.text(transText(vm, 'solarRevenue.pdf.overviewPage.areaKey'), 75, 235, {
      align: 'right',
    });
    doc.text(
      transText(vm, 'solarRevenue.pdf.overviewPage.areaText', {
        value: `${formatterTwoDigits.format(totalArea)} m²`,
      }),
      80,
      235,
    );
  }

  // user data
  doc.addPage();
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setTextColor(primaryColor);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setFontSize(48);
  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.user.title'), 20, 80);
  doc.setFont('Titillium Web', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(black);
  doc.text(transText(vm, 'solarRevenue.pdf.user.subtitleModules'), 20, 95);

  let y = 100;
  let x = 20;
  for (let i = 0; i < selectedModules.length; i++) {
    const currentModule = selectedModules[i];
    if (i > 0 && i % 4 === 0) {
      doc.addPage();
      doc.setTextColor(primaryColor);
      doc.setFont('Titillium Web', 'normal');
      doc.setDrawColor(yellow);
      doc.setLineWidth(1);
      doc.line(20, 25, 50, 25);
      doc.setFontSize(16);
      doc.text(
        transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
        20,
        40,
      );
      doc.setTextColor(black);
      y = 50;
      x = 20;
    }
    if (currentModule.screenShot) {
      doc.addImage(
        currentModule.screenShot,
        'png',
        x,
        y,
        80,
        80,
        undefined,
        'SLOW',
      );
      doc.setFillColor(primaryColor);
      doc.rect(x, y + 73, 80, 7, 'F');
      doc.setFontSize(10);
      doc.setTextColor(onPrimaryColor);
      doc.setFont('Titillium Web', 'bold');
      dynamicTextSize(
        transText(vm, 'solarRevenue.pdf.user.potSub', {
          area: `${formatterTwoDigits.format(currentModule.area)} m²`,
          yield: `${formatterZeroDigits.format(
            (currentModule.solarIrradiation * currentModule.efficiency) / 100,
          )} kWh/a`,
        }),
        x + 2,
        y + 78,
        76,
        12,
        doc,
      );
      if (i % 2 !== 0) {
        x = 20;
        y += 90;
      } else {
        x = 110;
      }
    }
  }

  // user data 1
  doc.addPage();
  doc.setTextColor(primaryColor);
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setTextColor(black);
  doc.text(transText(vm, 'solarRevenue.pdf.user.subtitleConsumption'), 20, 55);
  doc.setFont('Titillium Web', 'bold');
  doc.setFontSize(12);
  doc.text(transText(vm, 'solarRevenue.pdf.user.demandTitle'), 20, 65);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 70, 170, 20, 'F');
  doc.text(
    doc.splitTextToSize(
      transText(vm, 'solarRevenue.pdf.user.demandText1'),
      165,
    ),
    22,
    75,
    { lineHeightFactor: 1.5 },
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.demandPeople'), 20, 100);
  doc.text(
    `${solarOptions.userOptions.numberOfPersons} ${transText(
      vm,
      'solarRevenue.pdf.general.person',
    )}`,
    105,
    100,
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.demandHeat'), 20, 110);
  doc.text(`${getBooleanString(vm, isHeatPump)}`, 105, 110);
  doc.text(transText(vm, 'solarRevenue.pdf.user.demandArea'), 30, 120);
  doc.text(
    `${getLivingSpaceString(
      vm,
      isHeatPump,
      solarOptions.userOptions.livingSpace,
    )}`,
    105,
    120,
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.demandCar'), 20, 130);
  doc.text(`${getBooleanString(vm, isCar)}`, 105, 130);
  doc.text(transText(vm, 'solarRevenue.pdf.user.demandCarDistance'), 30, 140);
  doc.text(
    `${getCarString(
      vm,
      isCar,
      solarOptions.userOptions.annualDrivingDistance,
    )}`,
    105,
    140,
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.demandDemand'), 20, 150);
  doc.text(
    `${formatterZeroDigits.format(
      solarOptions.userOptions.electricityDemand,
    )} ${transText(vm, 'solarRevenue.pdf.general.kwhYear')}`,
    105,
    150,
  );
  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.user.consTitle'), 20, 160);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 165, 170, 33, 'F');
  doc.text(
    doc.splitTextToSize(transText(vm, 'solarRevenue.pdf.user.consText1'), 165),
    22,
    170,
    { lineHeightFactor: 1.5 },
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.consProfile'), 20, 210);
  doc.text(
    `${getConsumptionProfileString(vm, selectedConsumptionProfile)}`,
    105,
    210,
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.consDirect'), 20, 220);
  doc.text(
    `${formatterZeroDigits.format(
      solarOptions.userOptions.directConsumptionPortion,
    )} %`,
    105,
    220,
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.consIsStorage'), 20, 230);
  doc.text(`${getBooleanString(vm, isStorageConsumption)}`, 105, 230);
  doc.text(transText(vm, 'solarRevenue.pdf.user.consStorage'), 30, 240);
  doc.text(
    `${getStorageString(
      vm,
      isStorageConsumption,
      solarOptions.userOptions.storageConsumptionPortion,
    )}`,
    105,
    240,
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.consCapa'), 30, 250);
  doc.text(
    `${getCapaString(
      vm,
      isStorageConsumption,
      solarOptions.userOptions.storageCapacity,
    )}`,
    105,
    250,
  );

  // user data 2
  doc.addPage('a4', 'p');
  doc.setTextColor(primaryColor);
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setTextColor(black);
  doc.setFont('Titillium Web', 'bold');
  doc.setFontSize(12);
  doc.text(transText(vm, 'solarRevenue.pdf.user.costTitle'), 20, 55);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 60, 170, 45, 'F');
  doc.text(
    doc.splitTextToSize(
      transText(vm, 'solarRevenue.pdf.user.costText1', {
        start: solarOptions.adminOptions.helpPriceIncreaseStart,
        end: solarOptions.adminOptions.helpPriceIncreaseEnd,
        value: solarOptions.adminOptions.helpPriceIncreasePercentage,
      }),
      165,
    ),
    22,
    65,
    { lineHeightFactor: 1.5 },
  );
  doc.text(transText(vm, 'solarRevenue.pdf.user.costConsumption'), 20, 115);
  doc.text(
    `${formatterZeroDigits.format(
      solarOptions.userOptions.gridPurchaseCosts * 100,
    )} ct`,
    105,
    115,
  );

  doc.text(transText(vm, 'solarRevenue.pdf.user.costCompensation'), 20, 125);
  doc.text(
    `${formatterTwoDigits.format(
      solarOptions.userOptions.feedInTariff * 100,
    )} ct`,
    105,
    125,
  );

  doc.text(transText(vm, 'solarRevenue.pdf.user.costIncrease'), 20, 135);
  doc.text(
    `${formatterZeroDigits.format(
      solarOptions.userOptions.electricityPriceIncrease,
    )} %`,
    105,
    135,
  );

  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.user.financeTitle'), 20, 145);
  doc.setFont('Titillium Web', 'normal');

  doc.setFillColor(grey);
  doc.rect(20, 150, 170, 27, 'F');
  doc.text(
    doc.splitTextToSize(
      transText(vm, 'solarRevenue.pdf.user.financeText1'),
      165,
    ),
    22,
    155,
    { lineHeightFactor: 1.5 },
  );

  doc.text(transText(vm, 'solarRevenue.pdf.user.financeIs'), 20, 190);
  doc.text(`${getBooleanString(vm, isFinance)}`, 105, 190);

  doc.text(transText(vm, 'solarRevenue.pdf.user.financeInvest'), 20, 200);
  doc.text(`${formatterTwoDigits.format(investmentCosts)} €`, 105, 200);

  doc.text(transText(vm, 'solarRevenue.pdf.user.financeEquity'), 30, 210);
  doc.text(
    `${getEquityString(vm, isFinance, solarOptions.userOptions.equityCapital)}`,
    105,
    210,
  );

  doc.text(transText(vm, 'solarRevenue.pdf.user.financeCredit'), 30, 220);
  doc.text(`${getCreditString(vm, isFinance, creditAmount)}`, 105, 220);

  doc.text(transText(vm, 'solarRevenue.pdf.user.financeDuration'), 20, 230);
  doc.text(
    `${getDurationString(
      vm,
      isFinance,
      solarOptions.userOptions.creditPeriod,
    )}`,
    105,
    230,
  );

  doc.text(transText(vm, 'solarRevenue.pdf.user.financeInterest'), 20, 240);
  doc.text(
    `${getInterestString(
      vm,
      isFinance,
      solarOptions.userOptions.creditInterest,
    )}`,
    105,
    240,
  );

  // results
  doc.addPage();
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setTextColor(primaryColor);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setFontSize(48);
  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.result.title'), 20, 80);
  doc.setFont('Titillium Web', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(black);
  doc.text(transText(vm, 'solarRevenue.pdf.result.financeTitle'), 20, 95);
  doc.setFillColor(grey);
  doc.rect(20, 100, 170, 20, 'F');
  doc.setFontSize(12);
  doc.text(
    doc.splitTextToSize(
      transText(vm, 'solarRevenue.pdf.result.financeText'),
      165,
    ),
    22,
    105,
    { lineHeightFactor: 1.5 },
  );
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.rect(20, 125, 170, 28, 'S');
  if (isFinance) {
    doc.text(
      `${transText(
        vm,
        'solarRevenue.pdf.result.financeCreditAmount',
      )}: ${formatterTwoDigits.format(creditAmount)} €`,
      105,
      130,
      { align: 'center' },
    );
    doc.text(
      `${transText(
        vm,
        'solarRevenue.pdf.result.financeDuration',
      )}: ${formatterTwoDigits.format(
        solarOptions.userOptions.creditPeriod,
      )} ${transText(vm, 'solarRevenue.pdf.general.years')}`,
      105,
      140,
      { align: 'center' },
    );
    doc.text(
      `${transText(
        vm,
        'solarRevenue.pdf.result.financeInterestRate',
      )}: ${formatterTwoDigits.format(
        solarOptions.userOptions.creditInterest,
      )} %`,
      105,
      150,
      { align: 'center' },
    );
  } else {
    doc.text(transText(vm, 'solarRevenue.pdf.result.financeNo'), 105, 140, {
      align: 'center',
    });
  }
  autoTable(doc, {
    head: [localFinanceHeader],
    body: localFinance,
    foot: [localFinanceFooter],
    startY: 160,
    tableWidth: 170,
    headStyles: {
      overflow: 'linebreak',
      fillColor: primaryColor,
      fontSize: 7,
      textColor: onPrimaryColor,
    },
    footStyles: {
      overflow: 'linebreak',
      fillColor: darkGrey,
      fontSize: 7,
    },
    margin: {
      left: 20,
      bottom: 35,
    },
    bodyStyles: {
      overflow: 'visible',
      fontSize: 8,
    },
  });

  // expenses income
  doc.addPage();
  doc.setTextColor(primaryColor);
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setTextColor(black);
  doc.text(transText(vm, 'solarRevenue.pdf.result.revTitle'), 20, 55);
  doc.setFont('Titillium Web', 'bold');
  doc.setFontSize(12);
  doc.text(transText(vm, 'solarRevenue.pdf.result.revExpTitle'), 20, 65);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 70, 170, 14, 'F');
  doc.text(
    doc.splitTextToSize(
      transText(vm, 'solarRevenue.pdf.result.revExpText', {
        lifeTime: solarOptions.adminOptions.amortizationPeriod,
      }),
      165,
    ),
    22,
    75,
    { lineHeightFactor: 1.5 },
  );
  const imgRevenue = await createApexChartImageString(
    revenueChartOptions,
    solarOptions.colors.global.strokeColor.light ?? 'FFFFFF',
  );
  doc.addImage(imgRevenue, 'png', 20, 90, 170, 170, undefined, 'SLOW');

  // liquidity
  doc.addPage('a4', 'p');
  doc.setTextColor(primaryColor);
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setTextColor(black);
  doc.setFont('Titillium Web', 'bold');
  doc.setFontSize(12);
  doc.text(transText(vm, 'solarRevenue.pdf.result.liqTitle'), 20, 55);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 60, 170, 20, 'F');
  doc.text(
    doc.splitTextToSize(
      transText(vm, 'solarRevenue.pdf.result.liqText', {
        lifeTime: solarOptions.adminOptions.amortizationPeriod,
      }),
      165,
    ),
    22,
    65,
    { lineHeightFactor: 1.5 },
  );
  const imgLiquidity = await createApexChartImageString(
    liquidityChartOptions,
    solarOptions.colors.global.strokeColor.light ?? 'FFFFFF',
  );
  doc.addImage(imgLiquidity, 'png', 20, 85, 170, 170, undefined, 'SLOW');

  // co2
  doc.addPage();
  doc.setTextColor(primaryColor);
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setTextColor(black);
  doc.text(transText(vm, 'solarRevenue.pdf.result.envTitle'), 20, 55);
  doc.setFont('Titillium Web', 'bold');
  doc.setFontSize(12);
  doc.text(transText(vm, 'solarRevenue.pdf.result.co2Title'), 20, 65);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 70, 170, 20, 'F');
  doc.text(
    doc.splitTextToSize(transText(vm, 'solarRevenue.pdf.result.co2Text1'), 165),
    22,
    75,
    { lineHeightFactor: 1.5 },
  );

  if (co2Amortization > 0) {
    doc.text(
      doc.splitTextToSize(
        transText(vm, 'solarRevenue.pdf.result.co2Text2'),
        130,
      ),
      22,
      100,
      { lineHeightFactor: 1.5 },
    );
    doc.text(
      `${formatterTwoDigits.format(co2Amortization)} ${transText(
        vm,
        'solarRevenue.pdf.general.years',
      )}`,
      190,
      103,
      { align: 'right' },
    );
    doc.setFillColor(grey);
    doc.rect(20, 115, 170, 20, 'F');
    doc.text(
      doc.splitTextToSize(
        transText(vm, 'solarRevenue.pdf.result.co2Text3', {
          year: solarOptions.adminOptions.germanPowerMixYear,
        }),
        165,
      ),
      22,
      120,
      { lineHeightFactor: 1.5 },
    );
    doc.text(
      doc.splitTextToSize(
        transText(vm, 'solarRevenue.pdf.result.co2Text4', {
          lifeTime: solarOptions.adminOptions.amortizationPeriod,
        }),
        130,
      ),
      22,
      145,
      { lineHeightFactor: 1.5 },
    );
    doc.text(`${formatterZeroDigits.format(totalCoTwoSavings)} kg`, 190, 145, {
      align: 'right',
    });
  } else {
    doc.text(
      doc.splitTextToSize(
        transText(vm, 'solarRevenue.pdf.result.co2TextNoSavings'),
        165,
      ),
      22,
      100,
      { lineHeightFactor: 1.5 },
    );
  }

  // energy costs
  doc.addPage();
  doc.setTextColor(primaryColor);
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setTextColor(black);
  doc.text(transText(vm, 'solarRevenue.pdf.result.keyTitle'), 20, 55);
  doc.setFont('Titillium Web', 'bold');
  doc.setFontSize(12);
  doc.text(transText(vm, 'solarRevenue.pdf.result.keyCostTitle'), 20, 65);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 70, 170, 14, 'F');
  doc.text(
    doc.splitTextToSize(transText(vm, 'solarRevenue.pdf.result.keyText'), 165),
    22,
    75,
    { lineHeightFactor: 1.5 },
  );
  autoTable(doc, {
    head: [localEnergyPriceBalanceHeader],
    body: localEnergyPriceBalance,
    foot: [localEnergyPriceBalanceFooter],
    startY: 90,
    tableWidth: 170,
    headStyles: {
      overflow: 'linebreak',
      fillColor: primaryColor,
      fontSize: 7,
      textColor: onPrimaryColor,
    },
    footStyles: {
      overflow: 'linebreak',
      fillColor: darkGrey,
      fontSize: 7,
    },
    margin: {
      left: 20,
      bottom: 35,
    },
    bodyStyles: {
      overflow: 'visible',
      fontSize: 8,
    },
  });

  // energy
  doc.addPage('a4', 'p');
  doc.setTextColor(primaryColor);
  doc.setFont('Titillium Web', 'normal');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 25, 50, 25);
  doc.setFontSize(16);
  doc.text(
    transText(vm, 'solarRevenue.pdf.general.subTitle').toUpperCase(),
    20,
    40,
  );
  doc.setTextColor(black);
  doc.setFont('Titillium Web', 'bold');
  doc.setFontSize(12);
  doc.text(transText(vm, 'solarRevenue.pdf.result.keyEnergyTitle'), 20, 55);
  doc.setFont('Titillium Web', 'normal');
  doc.setFillColor(grey);
  doc.rect(20, 60, 170, 14, 'F');
  doc.text(
    doc.splitTextToSize(transText(vm, 'solarRevenue.pdf.result.keyText2'), 165),
    22,
    65,
    { lineHeightFactor: 1.5 },
  );
  autoTable(doc, {
    head: [localEnergyBalanceHeader],
    body: localEnergyBalance,
    foot: [localEnergyBalanceFooter],
    startY: 80,
    tableWidth: 170,
    headStyles: {
      overflow: 'linebreak',
      fillColor: primaryColor,
      fontSize: 7,
      textColor: onPrimaryColor,
    },
    footStyles: {
      overflow: 'linebreak',
      fillColor: darkGrey,
      fontSize: 7,
    },
    margin: {
      left: 20,
      bottom: 35,
    },
    bodyStyles: {
      overflow: 'visible',
      fontSize: 8,
    },
  });

  // last page
  doc.addPage();
  doc.addImage(lastPageImageString, 'png', 100, 30, 110, 60, undefined, 'FAST');
  doc.setDrawColor(yellow);
  doc.setLineWidth(1);
  doc.line(20, 120, 50, 120);
  doc.setTextColor(primaryColor);
  doc.setFontSize(48);
  doc.setFont('Titillium Web', 'bold');
  doc.text(transText(vm, 'solarRevenue.pdf.lastPage.title'), 20, 140);
  doc.setTextColor(black);
  doc.setFont('Titillium Web', 'normal');
  doc.setFontSize(10);
  doc.text(
    doc.splitTextToSize(
      transText(vm, 'solarRevenue.pdf.lastPage.infoContent'),
      170,
    ),
    20,
    150,
    { lineHeightFactor: 1.5 },
  );

  // global
  const totalPages = doc.getNumberOfPages();
  doc.setFont('Titillium Web', 'normal');
  doc.setFontSize(12);
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(darkGrey);
    if (i !== 1 && i !== totalPages) {
      doc.setFont('Titillium Web', 'normal');
      doc.text(`${i} / ${totalPages}`, 190, 285, { align: 'right' });
      doc.setFont('Titillium Web', 'bold');
      doc.text(solarOptions.pdf.footerLineOne, 20, 280);
      doc.setFont('Titillium Web', 'normal');
      doc.text(solarOptions.pdf.footerLineTwo, 20, 285);
    }
  }

  // Save
  doc.save('solarReport.pdf');
  isRunning.value = false;
}
