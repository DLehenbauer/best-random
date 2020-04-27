import { benchmark, getTestArgs } from "hotloop"
import { generators } from "./generators";

const { generatorName, mode } = getTestArgs();
const rng = generators.get(generatorName);
const fn = (rng as any)[mode];

benchmark(`${generatorName} (${mode})`, fn);
