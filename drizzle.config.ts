import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
  },
  tablesFilter: ["lavistique_*"],
} satisfies Config;
