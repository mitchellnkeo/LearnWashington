import { createSqlClient } from "@fwty/database";
import { requirePooledDatabaseUrl } from "@/lib/env";

export function getSql() {
  return createSqlClient(requirePooledDatabaseUrl());
}
