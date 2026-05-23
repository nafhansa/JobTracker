import type { AutofillData } from "../storage";
import type { MappedField } from "../mapper";

export interface ATSAdapter {
  name: string;
  detect: () => boolean;
  getForm: () => HTMLElement | null;
  mapFields: (data: AutofillData) => MappedField[];
}

const adapters: ATSAdapter[] = [];

export function getATSAdapter(): ATSAdapter | null {
  for (const adapter of adapters) {
    if (adapter.detect()) return adapter;
  }
  return null;
}

export { adapters };
