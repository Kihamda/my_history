import { FirestoreClient } from "../lib/firestore";
import { encodeValue } from "../lib/firestore/converter";
import type { AppBindings } from "../types/bindings";
import type {
  ScoutEvent,
  ScoutGinosho,
  ScoutRecord,
  ScoutSearchResult,
  ScoutUnitGrade,
  UnitExperience,
} from "../types/domain/scout";

const SCOUTS_COLLECTION = "scouts";

const buildClient = (env: AppBindings) => new FirestoreClient(env);

const mapUnit = (unit: any, index: number): UnitExperience => ({
  id: String(unit?.id ?? `unit-${index}`),
  name: unit?.name ?? "",
  joinedDate: unit?.joinedDate ?? null,
  experienced: Boolean(unit?.experienced),
  grade: Array.isArray(unit?.grade)
    ? unit.grade.map(mapGrade)
    : unit?.grade ?? [],
  works: Array.isArray(unit?.works)
    ? unit.works.map((work: any) => ({
        id: work?.id ?? undefined,
        type: String(work?.type ?? ""),
        begin: work?.begin ?? null,
        end: work?.end ?? null,
      }))
    : [],
});

const mapGrade = (grade: any): ScoutUnitGrade => ({
  id: String(grade?.id ?? grade?.unique ?? ""),
  unique: String(grade?.unique ?? grade?.id ?? ""),
  name: grade?.name ?? "",
  has: Boolean(grade?.has),
  date: grade?.date ?? null,
  details: Array.isArray(grade?.details)
    ? grade.details.map((detail: any, idx: number) => ({
        id: String(detail?.id ?? `${grade?.id ?? "detail"}-${idx}`),
        number: detail?.number ?? undefined,
        description: detail?.description ?? undefined,
        has: Boolean(detail?.has),
        date: detail?.date ?? null,
      }))
    : [],
});

const mapGinosho = (item: any): ScoutGinosho => ({
  id: String(item?.id ?? item?.unique ?? ""),
  unique: String(item?.unique ?? item?.id ?? ""),
  name: item?.name ?? "",
  certName: item?.certName ?? undefined,
  cert: item?.cert ?? undefined,
  date: item?.date ?? null,
  has: Boolean(item?.has),
  url: item?.url ?? undefined,
  details: Array.isArray(item?.details)
    ? item.details.map((detail: any, idx: number) => ({
        sort: detail?.sort ?? idx + 1,
        number: detail?.number ?? undefined,
        description: detail?.description ?? undefined,
        has: Boolean(detail?.has),
        date: detail?.date ?? null,
      }))
    : [],
});

const serializeGinosho = (item: ScoutGinosho): Record<string, unknown> => ({
  id: item.unique,
  has: item.has,
  date: item.date ?? null,
  certName: item.certName ?? null,
  url: item.url ?? null,
  details: item.details.map((detail) => ({
    sort: detail.sort,
    number: detail.number ?? null,
    description: detail.description ?? null,
    has: detail.has,
    date: detail.date ?? null,
  })),
});

const mapEvent = (event: any): ScoutEvent => ({
  id: String(event?.id ?? ""),
  title: String(event?.title ?? ""),
  description: event?.description ?? undefined,
  type: event?.type ?? undefined,
  start: event?.start ?? null,
  end: event?.end ?? null,
});

const serializeEvent = (event: ScoutEvent): Record<string, unknown> => ({
  title: event.title,
  description: event.description ?? null,
  type: event.type ?? null,
  start: event.start ?? null,
  end: event.end ?? null,
});

export const getScoutRecord = async (
  env: AppBindings,
  scoutId: string
): Promise<ScoutRecord | null> => {
  const client = buildClient(env);
  const base = await client.getDocument<any>(`${SCOUTS_COLLECTION}/${scoutId}`);

  if (!base) {
    return null;
  }

  const [ginoshoDocs, eventDocs] = await Promise.all([
    client.listDocuments<any>(`${SCOUTS_COLLECTION}/${scoutId}/ginosho`),
    client.listDocuments<any>(`${SCOUTS_COLLECTION}/${scoutId}/events`),
  ]);

  const unit = Array.isArray(base.unit)
    ? base.unit.map((unit: any, index: number) => mapUnit(unit, index))
    : [];

  return {
    id: scoutId,
    personal: base.personal ?? {},
    unit,
    ginosho: ginoshoDocs.map(mapGinosho),
    events: eventDocs.map(mapEvent),
    updatedAt: base.updatedAt ?? base.updateTime ?? null,
  };
};

export const updateScoutRecord = async (
  env: AppBindings,
  record: ScoutRecord
): Promise<void> => {
  const client = buildClient(env);

  const doc = {
    personal: record.personal,
    unit: record.unit,
    updatedAt: new Date().toISOString(),
  } as Record<string, unknown>;

  await client.setDocument(`${SCOUTS_COLLECTION}/${record.id}`, doc, {
    merge: false,
  });

  await syncSubcollection(
    client,
    `${SCOUTS_COLLECTION}/${record.id}/ginosho`,
    record.ginosho,
    serializeGinosho
  );

  await syncSubcollection(
    client,
    `${SCOUTS_COLLECTION}/${record.id}/events`,
    record.events,
    serializeEvent
  );
};

const syncSubcollection = async <T extends { id: string }>(
  client: FirestoreClient,
  collectionPath: string,
  items: T[],
  serialize: (item: T) => Record<string, unknown>
): Promise<void> => {
  const existing = await client.listDocuments<any>(collectionPath, 300);
  const existingIds = new Set(existing.map((doc) => doc.id));
  const incomingIds = new Set(items.map((item) => item.id));

  await Promise.all(
    items.map((item) =>
      client.setDocument(`${collectionPath}/${item.id}`, serialize(item), {
        merge: false,
      })
    )
  );

  const deletions: Promise<void>[] = [];
  existingIds.forEach((id) => {
    if (!incomingIds.has(id)) {
      deletions.push(client.deleteDocument(`${collectionPath}/${id}`));
    }
  });

  await Promise.all(deletions);
};

interface ScoutSearchFilters {
  groupId: string;
  name?: string;
  scoutId?: string;
  currentUnit?: string[];
  limit?: number;
}

export const searchScouts = async (
  env: AppBindings,
  filters: ScoutSearchFilters
): Promise<ScoutSearchResult[]> => {
  const client = buildClient(env);
  const whereFilters: any[] = [
    {
      fieldFilter: {
        field: { fieldPath: "personal.belongs" },
        op: "EQUAL",
        value: encodeValue(filters.groupId),
      },
    },
  ];

  if (filters.name) {
    whereFilters.push(
      {
        fieldFilter: {
          field: { fieldPath: "personal.name" },
          op: "GREATER_THAN_OR_EQUAL",
          value: encodeValue(filters.name),
        },
      },
      {
        fieldFilter: {
          field: { fieldPath: "personal.name" },
          op: "LESS_THAN_OR_EQUAL",
          value: encodeValue(`${filters.name}\uf8ff`),
        },
      }
    );
  }

  if (filters.scoutId) {
    whereFilters.push({
      fieldFilter: {
        field: { fieldPath: "personal.ScoutId" },
        op: "EQUAL",
        value: encodeValue(filters.scoutId),
      },
    });
  }

  if (filters.currentUnit?.length) {
    whereFilters.push({
      fieldFilter: {
        field: { fieldPath: "personal.currentUnit" },
        op: "IN",
        value: {
          arrayValue: {
            values: filters.currentUnit.map((unit) => encodeValue(unit)!),
          },
        },
      },
    });
  }

  const structuredQuery: Record<string, unknown> = {
    from: [{ collectionId: SCOUTS_COLLECTION }],
    limit: filters.limit ?? 30,
  };

  if (whereFilters.length === 1) {
    structuredQuery.where = whereFilters[0];
  } else if (whereFilters.length > 1) {
    structuredQuery.where = {
      compositeFilter: {
        op: "AND",
        filters: whereFilters,
      },
    };
  }

  const results = await client.runQuery<any>({
    structuredQuery,
  });

  return results.map((doc) => ({
    id: doc.id,
    name: doc.personal?.name ?? "",
    scoutId: doc.personal?.ScoutId,
    currentUnit: doc.personal?.currentUnit,
    experiencedUnits: Array.isArray(doc.unit)
      ? doc.unit.map((unit: any) => unit?.id).filter(Boolean)
      : [],
  }));
};
