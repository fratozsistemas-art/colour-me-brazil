export const configureConsole = () => {
  if (import.meta.env.DEV) {
    return;
  }

  console.log = () => {};
  console.warn = () => {};
  console.debug = () => {};
};
