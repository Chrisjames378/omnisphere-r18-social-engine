declare module "react" {
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prev: T) => T)) => void];
  export function useState<T = undefined>(): [T | undefined, (newState: T | undefined | ((prev: T | undefined) => T | undefined)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T = undefined>(): { current: T | undefined };
}
declare module "react-native";
declare module "expo-router";
declare module "lucide-react-native";
