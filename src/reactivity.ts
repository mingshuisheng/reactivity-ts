type Effect = {
  execute: () => void;
  deps: Set<Deps>;
}

type Deps = Set<Effect>;

const effectStack: Effect[] = [];

function subscribe(effect: Effect, deps: Deps) {
  deps.add(effect);
  effect.deps.push(deps);
}

function cleanup(effect: Effect) {
  effect.deps.forEach((deps) => {
    deps.delete(effect);
  });
  effect.deps = [];
}

export function ref<T>(value: T) {
  const deps: Set<Effect> = new Set();

  const getter = () => {
    if (effectStack.length) {
      subscribe(effectStack[effectStack.length - 1], deps);
    }
    return value;
  }

  const setter = (newValue: T) => {
    value = newValue;
    //此处deps必须是新的，否则会execute执行时又往deps里面添加effect，导致死循环
    [...deps].forEach((effect) => {
      effect.execute();
    });
  }

  return [getter, setter] as const;
}

export function watchEffect(fn: () => void) {
  const effect: Effect = {
    execute: () => {
      cleanup(effect);
      effectStack.push(effect);
      try {
        fn();
      } finally {
        effectStack.pop();
      }
    },
    deps: new Set(),
  }
  effect.execute();
}

export function computed<T>(fn: () => T) {
  const [getter, setter] = ref<T | null>(null);
  watchEffect(() => {
    setter(fn());
  });
  return getter as () => T;
}
