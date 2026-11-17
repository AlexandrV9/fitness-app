export type ErrorMapperFn = (error: Error) => Error | null;

class ErrorMapper {
  private readonly mappers: ErrorMapperFn[] = [];

  register(mapper: ErrorMapperFn): void {
    if (this.mappers.includes(mapper)) return;
    this.mappers.push(mapper);
  }

  map(error: Error): Error {
    for (const mapper of this.mappers) {
      const mapped = mapper(error);
      if (mapped) return mapped;
    }
    return error;
  }
}

export const globalErrorMapper = new ErrorMapper();
