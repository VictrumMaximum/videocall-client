export const targetValueSetter = (callback: Function) => (e: any) => {
  callback(e.target.value);
};
