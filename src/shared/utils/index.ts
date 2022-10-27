export const sleep = (ms: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const capitalizeText = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
