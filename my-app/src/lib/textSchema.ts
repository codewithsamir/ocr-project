import { z } from "zod";
export const textSchema = z.object({
    correctedText: z.string(),
  });