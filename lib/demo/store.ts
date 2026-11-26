"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createSeed } from "./seed";
import { runAction } from "./actions";
import { isPersistedState } from "./validation";
import type { Command, DemoState, Input, ActionResult } from "./types";
interface Store {
  data: DemoState;
  hydrated: boolean;
  notice: string;
  error: string;
  storageError: string;
  execute: (command: Command, input?: Input) => ActionResult;
  reset: () => void;
  clear: () => void;
  hydrate: () => void;
}
export const useDemo = create<Store>()(
  persist(
    (set, get) => ({
      data: createSeed(),
      hydrated: false,
      notice: "",
      error: "",
      storageError: "",
      execute: (command, input) => {
        const result = runAction(get().data, command, input);
        if (result.ok)
          set({ data: result.state, notice: result.message, error: "" });
        else set({ error: result.error, notice: "" });
        return result;
      },
      reset: () =>
        set({
          data: createSeed(),
          notice: "Original demo restored",
          error: "",
        }),
      clear: () => set({ notice: "", error: "" }),
      hydrate: () => set({ hydrated: true }),
    }),
    {
      name: "timbrel-studio-demo-v1",
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value);
          } catch {
            if (!useDemo.getState().storageError)
              setTimeout(
                () =>
                  useDemo.setState({
                    storageError:
                      "Browser storage is unavailable or full. Changes remain available for this session only.",
                  }),
                0,
              );
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (s) => ({ data: s.data }),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = persisted as { data?: DemoState } | undefined;
        const d = p?.data;
        const valid = isPersistedState(d);
        return {
          ...current,
          data: valid ? d : createSeed(),
          storageError:
            !valid && persisted
              ? "Saved demo was incompatible and has been reset."
              : "",
        };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error)
          useDemo.setState({
            storageError:
              "Saved demo could not be read. A fresh demo is available.",
          });
        useDemo.setState({ hydrated: true });
      },
    },
  ),
);
