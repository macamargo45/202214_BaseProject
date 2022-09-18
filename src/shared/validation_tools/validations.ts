export function belongsTo(object: any, array: Array<any>) {
  const objectInArray = array.find((i) => i.id === object.id);
  return objectInArray !== undefined;
}
