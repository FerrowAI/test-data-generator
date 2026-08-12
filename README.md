# Test Data Generator

Generate realistic test data for any schema instantly. Works with Ferrow for testing AI agents.

```javascript
const generator = new TestDataGenerator(schema);
const fakeUsers = generator.generate(100); // 100 realistic users
```

## Features
- ✓ Faker-integrated (names, emails, dates)
- ✓ Schema-driven generation
- ✓ Relationships & foreign keys
- ✓ Works with Ferrow test suite

## Ferrow Integration
```javascript
const ferrow = new Ferrow.Agent();
const testData = generator.generate(50);
await ferrow.test(testData); // Test agents with realistic data
```

## License: MIT
