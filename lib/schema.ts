
export interface SchemaIndex {
  type: 'global' | 'local';
  name: string;
  hashKey: string;
  rangeKey?: string;
}

export interface SchemaOptions {
  hashKey: string;
  rangeKey?: null | string;
  tableName: string;
  timestamps?: boolean;
  createdAt?: string;
  updatedAt?: string;
  indexes?: SchemaIndex[];
  validation?: (data: any) => boolean;
}

export class Schema {
  public readonly hashKey: string;
  public readonly rangeKey: null | string;
  public readonly tableName: string;
  public readonly timestamps: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  public readonly globalIndexes: Record<string, unknown> = {};
  public readonly secondaryIndexes: Record<string, unknown> = {};

  private readonly validation: (data: any) => boolean;

  constructor({
    hashKey,
    rangeKey = null,
    tableName,
    timestamps = true,
    createdAt = 'createdAt',
    updatedAt = 'updatedAt',
    indexes = [],
    validation = (data: any) => true,
  }: SchemaOptions) {
    this.hashKey = hashKey;
    this.rangeKey = rangeKey;
    this.tableName = tableName;
    this.timestamps = timestamps;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.validation = validation;
    this.setIndexes(indexes);
    // TODO: this wasn't converted. is it still needed?
    // self._modelDatatypes = internals.parseDynamoTypes(self._modelSchema.describe());
  }

  private setIndexes(indexes: SchemaIndex[]): void {
    for (const index of indexes) {
      if (index.type === 'global') {
        this.globalIndexes[index.name] = index;
      }
      else if (index.type === 'local') {
        this.secondaryIndexes[index.name] = index;
      }
      else {
        throw new Error('unsupported index type received');
      }
    }
  }

  public validate(data: any): boolean {
    return this.validation(data);
  }
}
