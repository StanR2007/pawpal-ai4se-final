import { join } from "node:path";
import { createJsonStore } from "./json-store";
import { createRepository } from "./repository";

export const demoRepository = createRepository(createJsonStore(join(process.cwd(), "data", "pawpal.json")));
