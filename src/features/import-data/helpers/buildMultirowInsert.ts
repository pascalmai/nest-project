import { valuePair } from './valuePair';

export function buildMultirowInsert(
  tableName: string,
  arrayOfObjects: any[],
): [string, any[]] {
  const props = Object.keys(arrayOfObjects[0]);
  const propCount = props.length;

  return [
    `
      INSERT INTO "${tableName}" (${props.map((prop) => `"${prop}"`).join(',')})
      VALUES ${arrayOfObjects
        .map((_, i) => `(${valuePair(propCount, i * propCount)})`)
        .join(',')}
    `,
    arrayOfObjects.map((obj) => Object.values(obj)).flat(),
  ];
}
