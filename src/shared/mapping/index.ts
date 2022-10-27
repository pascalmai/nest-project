import { ClassConstructor, plainToClass } from 'class-transformer';

const options = { excludeExtraneousValues: true };

export const entityToDto = <E, D>(
  entity: E,
  dtoClass: ClassConstructor<D>,
): D => {
  return plainToClass(dtoClass, entity, options);
};

export const entitiesToDtos = <E, D>(
  entity: E[],
  dtoClass: ClassConstructor<D>,
): D[] => {
  return plainToClass(dtoClass, entity, options);
};
