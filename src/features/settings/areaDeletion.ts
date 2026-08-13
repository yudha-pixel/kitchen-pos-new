export interface DeletableArea {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface AreaDeletionRequest<T extends DeletableArea> {
  areas: T[];
  areaToDelete: T | null;
}

export function requestAreaDeletion<T extends DeletableArea>(
  areas: readonly T[],
  areaId: string,
): AreaDeletionRequest<T> {
  return {
    areas: [...areas],
    areaToDelete: areas.find((area) => area.id === areaId) ?? null,
  };
}

export function confirmAreaDeletion<T extends DeletableArea>(
  areas: readonly T[],
  areaToDelete: T | null,
): T[] {
  if (!areaToDelete) {
    return [...areas];
  }

  return areas.filter((area) => area.id !== areaToDelete.id);
}
