import isString from 'lodash/isString';

export const stringToBoolean = (value: string): boolean => {
  return isString(value) && value === 'true';
};
