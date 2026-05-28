export class Category {
  private constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  static fromJson(data: Partial<Category>) {
    return new Category(
      data?.id || '',
      data?.name || '',
    );
  }
}