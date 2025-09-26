import type { ISODateString } from "./common";

export interface GinoshoDetailMaster {
  sort: number;
  number: string;
  description: string;
}

export interface GinoshoMaster {
  id: string;
  name: string;
  cert: boolean;
  url: string;
  details: GinoshoDetailMaster[];
}

export interface GradeDetailMaster {
  id: number;
  number: string;
  description: string;
}

export interface GradeMaster {
  id: string;
  name: string;
  details: GradeDetailMaster[];
}

export interface MasterCacheEntry<T> {
  value: T;
  cachedAt: ISODateString;
}
