const logger = {
  log: (message: string, ...optional: Array<any>): void => {
    if (import.meta.env.DEV) console.log(message, optional);
  },
  error: (message: string, ...optional: Array<any>): void => {
    if (import.meta.env.DEV) console.error(message, optional);
  },
};

export default logger;
