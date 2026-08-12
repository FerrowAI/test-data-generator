// Compile TS first: tsc
const { TestDataGenerator } = require('../dist/index.js');

// Demo: seeded deterministic generation
const gen = new TestDataGenerator({
  id: 'sequence()',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  salary: { type: 'int', min: 40000, max: 150000 },
  hired: { type: 'date', daysAgo: 365 },
  active: 'bool',
}, 42);

const employees = gen.generate(3);

console.log('Generated with seed 42:');
console.log(JSON.stringify(employees, null, 2));

// Verify reproducibility: same seed → same data
const gen2 = new TestDataGenerator({
  id: 'sequence()',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  salary: { type: 'int', min: 40000, max: 150000 },
  hired: { type: 'date', daysAgo: 365 },
  active: 'bool',
}, 42);

const employees2 = gen2.generate(3);
const match = JSON.stringify(employees) === JSON.stringify(employees2);
console.log(`\nReproducibility check (seed 42 twice): ${match ? 'PASS' : 'FAIL'}`);

// Different seed → different data
const gen3 = new TestDataGenerator({
  id: 'sequence()',
  firstName: 'firstName',
  lastName: 'lastName',
}, 99);
const employees3 = gen3.generate(1);
const different = JSON.stringify(employees[0]) !== JSON.stringify(employees3[0]);
console.log(`Different seed check (seed 42 vs 99): ${different ? 'PASS' : 'FAIL'}`);
