type Callback = () => void;

let listeners: Callback[] = [];

export const subscribe = (cb: Callback) => {
  listeners.push(cb);
};

export const unsubscribe = (cb: Callback) => {
  listeners = listeners.filter((l) => l !== cb);
};

export const emit = () => {
  listeners.forEach((cb) => cb());
};
