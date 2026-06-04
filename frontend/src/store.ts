export { store } from "./store/index";
export type { AppDispatch, RootState } from "./store/index";

export const resetStore = () => ({ type: "RESET_STORE" });
