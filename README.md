# test-data-generator

Seeded deterministic fake-data generator with schema-driven generation. Same seed produces identical output every time — critical for reproducible test suites.

## Quickstart

```typescript
import { TestDataGenerator } from 'test-data-generator';

const gen = new TestDataGenerator({
  id: 'sequence()',
  name: 'firstName',
  email: 'email',
  company: 'company',
  salary: { type: 'int', min: 40000, max: 150000 },
}, 42); // seed=42 for reproducibility

const users = gen.generate(5);
// Every run with seed 42 produces identical output
```

## API

### Constructor

```typescript
new TestDataGenerator(schema, seed?)
```

- `schema`: Record<string, GeneratorSpec> — field definitions
- `seed`: number (default: 42) — PRNG seed for reproducibility

### Generator Types

**Built-in generators** (string names or objects with `type`):

- `'firstName'` — Random first name from pool
- `'lastName'` — Random last name from pool
- `'email'` — Random email address
- `'uuid'` — UUID v4-style string
- `'int'` / `{ type: 'int', min?: number, max?: number }` — Integer (default 0–100)
- `'float'` / `{ type: 'float', min?: number, max?: number, precision?: number }` — Float (default 0–1)
- `'bool'` — Random boolean
- `'date'` / `{ type: 'date', daysAgo?: number }` — Date within last N days (default 30)
- `'pick'` / `{ type: 'pick', values: any[] }` — Random item from array
- `'company'` — Random company name
- `'street'` — Random street address

**Special generators**:

- `'sequence()'` — Auto-incrementing counter (1, 2, 3, …)
- `'ref(fieldName)'` — Reference previous record's field
- Custom function: `(state) => any` — Full control

## Scope & Limits

- **Zero runtime dependencies** — crypto and perf_hooks not used
- **Deterministic only**: Same seed, same data. Reseeding restarts the sequence.
- **No persistence** — generates in-memory; no database or file I/O
- **Word pools fixed** — first/last names and companies are built-in and small
- **No relationships beyond simple ref()** — no foreign-key constraints or cascading

## Example

```typescript
const gen = new TestDataGenerator({
  id: 'sequence()',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  department: { type: 'pick', values: ['Sales', 'Engineering', 'HR'] },
  startDate: { type: 'date', daysAgo: 365 },
  managerId: (state) => state.random() > 0.5 ? null : Math.floor(state.random() * 10),
}, 123);

const staff = gen.generate(100);
console.log(staff[0]); // Reproducible across runs
```

## License

MIT

---

Sponsored by [Ferrow](https://ferrow.ai)
