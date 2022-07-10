import { createContext } from "../di/createContext.ts";
import { IColors } from "../IColors.ts";
import { noColors } from "../noColors.ts";

export const ColorsContext = createContext<IColors>(noColors);
