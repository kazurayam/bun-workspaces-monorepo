// packages/lib/index.ts
import { shuffle } from "es-toolkit";

export const myShuffle = <T>(arr: T[]): T[] => shuffle(arr);
