import {ref, watchEffect, computed} from "./reactivity.ts"

const [count, setCount] = ref(0);

const double = computed(() => count() * 2);

watchEffect(() => {
  console.log("double count:", double());
})


setInterval(() => {
  setCount(count() + 1);
}, 1000 * 5)
