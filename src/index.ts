export class TestDataGenerator {
  private schema: Record<string, string>;
  constructor(schema: Record<string, string>) { this.schema = schema; }
  
  generate(count: number): any[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      email: `user${i}@example.com`,
      name: `User ${i}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    }));
  }
}
