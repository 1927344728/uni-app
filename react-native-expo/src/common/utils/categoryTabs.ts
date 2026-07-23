type CategoryRow = { categoryId?: number; typeId?: number; typeName?: string; subTypeId?: number; subTypeName?: string };

export type TabOption = { id: string | null; name: string };

export function uniqueTypeTabs(categories: CategoryRow[], categoryId: number): TabOption[] {
  const tabs: TabOption[] = [{ id: null, name: '全部' }];
  const seen = new Set<string>();
  for (const item of categories) {
    if (Number(item.categoryId) !== categoryId || item.typeId == null) continue;
    const id = String(item.typeId);
    if (seen.has(id)) continue;
    seen.add(id);
    tabs.push({ id, name: String(item.typeName ?? '') });
  }
  return tabs;
}

export function uniqueValueOptions<T extends { value: string; name: string }>(options: T[]): T[] {
  const seen = new Set<string>();
  return options.filter(option => {
    if (seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

export function mergeUniqueById<T extends { id?: unknown }>(current: T[], next: T[], append: boolean): T[] {
  const merged = append ? [...current, ...next] : next;
  const seen = new Set<string>();
  return merged.filter(item => {
    const id = String(item.id ?? '');
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
