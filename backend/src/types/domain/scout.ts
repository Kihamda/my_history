import type { ISODateString } from "./common";

export interface ScoutWork {
  id?: string;
  type: string;
  begin?: ISODateString;
  end?: ISODateString;
}

export interface GradeDetailProgress {
  id: string;
  number?: string;
  description?: string;
  has: boolean;
  date?: ISODateString;
}

export interface ScoutUnitGrade {
  id: string;
  unique: string;
  name?: string;
  has: boolean;
  date?: ISODateString;
  details: GradeDetailProgress[];
}

export interface UnitExperience {
  id: string;
  name?: string;
  joinedDate?: ISODateString;
  experienced: boolean;
  grade: ScoutUnitGrade[];
  works: ScoutWork[];
}

export interface ScoutGinoshoDetail {
  sort: number;
  number?: string;
  description?: string;
  has: boolean;
  date?: ISODateString;
}

export interface ScoutGinosho {
  id: string;
  unique: string;
  name?: string;
  date?: ISODateString;
  certName?: string;
  cert?: boolean;
  has: boolean;
  url?: string;
  details: ScoutGinoshoDetail[];
}

export interface ScoutEvent {
  id: string;
  title: string;
  description?: string;
  type?: string;
  start?: ISODateString;
  end?: ISODateString;
}

export interface ScoutPersonalData {
  name: string;
  ScoutId?: string;
  currentUnit?: string;
  belongs?: string;
  [key: string]: unknown;
}

export interface ScoutRecord {
  id: string;
  personal: ScoutPersonalData;
  unit: UnitExperience[];
  ginosho: ScoutGinosho[];
  events: ScoutEvent[];
  updatedAt?: ISODateString;
}

export interface ScoutSearchResult {
  id: string;
  name: string;
  scoutId?: string;
  currentUnit?: string;
  experiencedUnits: string[];
}
