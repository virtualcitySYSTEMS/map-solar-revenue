import { VcsAction } from '@vcmap/ui';
import { SolarSurface } from './revenueCalculator/areaSelector/areaSelector.js';

export type ModuleMaterial = 'mono' | 'poly' | 'cigs' | 'cdte';
export type SolarCalculationProgress = {
  numberTotalRays: number;
  numberCurrentRays: number;
  progress: number;
};
export type SolarModule = {
  id: string | number;
  featureId: number;
  area: number;
  zenith?: number;
  azimuth?: number;
  efficiency: number;
  costs: number;
  kwp: number;
  solarIrradiation: number;
  degradation: number;
  material?: ModuleMaterial;
  solarSurface?: SolarSurface;
  actions?: VcsAction[];
  calculatedProgress: SolarCalculationProgress;
};
