// Mulberry32 seeded PRNG: produces deterministic output from a seed
function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6d2b79f5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Built-in word pools for realistic data
const FIRST_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah', 'Ivan', 'Julia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const COMPANIES = ['Acme', 'TechCorp', 'DataFlow', 'CloudX', 'NexGen', 'LogicHub', 'Velocity', 'Zenith', 'Prism', 'Forge'];
const STREET_NAMES = ['Main', 'Oak', 'Elm', 'Pine', 'Maple', 'Cedar', 'Birch', 'Willow', 'Ash', 'Cherry'];

type GeneratorFn = (state: GeneratorState) => any;
type GeneratorSpec = string | GeneratorFn | { type: string; [key: string]: any };

interface GeneratorState {
  random: () => number;
  sequence: (name: string) => number;
  refs: Record<string, any>;
}

class SequenceCounter {
  private counters: Record<string, number> = {};
  next(name: string): number {
    this.counters[name] = (this.counters[name] ?? 0) + 1;
    return this.counters[name];
  }
}

// Built-in generator functions
const GENERATORS: Record<string, (state: GeneratorState, opts?: any) => any> = {
  firstName: (state) => FIRST_NAMES[Math.floor(state.random() * FIRST_NAMES.length)],
  lastName: (state) => LAST_NAMES[Math.floor(state.random() * LAST_NAMES.length)],
  email: (state) => {
    const user = `user${Math.floor(state.random() * 100000)}`;
    const domains = ['example.com', 'test.dev', 'mail.io'];
    const domain = domains[Math.floor(state.random() * domains.length)];
    return `${user}@${domain}`;
  },
  uuid: (state) => {
    const hex = () => Math.floor(state.random() * 16).toString(16);
    const chunk = (n: number) => Array.from({length: n}, hex).join('');
    return `${chunk(8)}-${chunk(4)}-${chunk(4)}-${chunk(4)}-${chunk(12)}`;
  },
  int: (state, opts?: {min?: number; max?: number}) => {
    const min = opts?.min ?? 0;
    const max = opts?.max ?? 100;
    return Math.floor(state.random() * (max - min + 1)) + min;
  },
  float: (state, opts?: {min?: number; max?: number; precision?: number}) => {
    const min = opts?.min ?? 0;
    const max = opts?.max ?? 1;
    const val = state.random() * (max - min) + min;
    const p = opts?.precision ?? 2;
    return Math.round(val * Math.pow(10, p)) / Math.pow(10, p);
  },
  bool: (state) => state.random() > 0.5,
  date: (state, opts?: {daysAgo?: number}) => {
    const daysAgo = opts?.daysAgo ?? 30;
    const ms = state.random() * daysAgo * 24 * 60 * 60 * 1000;
    // Use fixed reference: 2026-01-01 00:00:00 UTC for reproducibility
    const refTime = new Date('2026-01-01T00:00:00Z').getTime();
    return new Date(refTime - ms);
  },
  pick: (state, opts?: {values?: any[]}) => {
    const values = opts?.values ?? [];
    return values[Math.floor(state.random() * values.length)];
  },
  company: (state) => COMPANIES[Math.floor(state.random() * COMPANIES.length)],
  street: (state) => {
    const num = Math.floor(state.random() * 999) + 1;
    const name = STREET_NAMES[Math.floor(state.random() * STREET_NAMES.length)];
    return `${num} ${name} St`;
  },
};

export class TestDataGenerator {
  private schema: Record<string, GeneratorSpec>;
  private seed: number;

  constructor(schema: Record<string, GeneratorSpec>, seed: number = 42) {
    this.schema = schema;
    this.seed = seed;
  }

  generate(count: number): Record<string, any>[] {
    const rng = mulberry32(this.seed);
    const seqCounter = new SequenceCounter();
    const results: Record<string, any>[] = [];

    for (let i = 0; i < count; i++) {
      const state: GeneratorState = {
        random: rng,
        sequence: (name: string) => seqCounter.next(name),
        refs: results[i - 1] ?? {},
      };

      const record: Record<string, any> = {};
      for (const [field, spec] of Object.entries(this.schema)) {
        record[field] = this.resolveSpec(spec, state);
      }
      results.push(record);
    }

    return results;
  }

  private resolveSpec(spec: GeneratorSpec, state: GeneratorState): any {
    if (typeof spec === 'function') {
      return spec(state);
    }
    if (typeof spec === 'string') {
      if (spec.startsWith('ref(') && spec.endsWith(')')) {
        const fieldName = spec.slice(4, -1);
        return state.refs[fieldName];
      }
      if (spec === 'sequence()') {
        return state.sequence('seq');
      }
      const [name, optsStr] = spec.split(':');
      const gen = GENERATORS[name];
      if (gen) {
        const opts = optsStr ? JSON.parse(optsStr) : undefined;
        return gen(state, opts);
      }
      throw new Error(`Unknown generator: ${name}`);
    }
    if (typeof spec === 'object') {
      const type = spec.type as string;
      const gen = GENERATORS[type];
      if (gen) {
        return gen(state, spec);
      }
      throw new Error(`Unknown generator type: ${type}`);
    }
    throw new Error(`Invalid spec: ${spec}`);
  }
}
