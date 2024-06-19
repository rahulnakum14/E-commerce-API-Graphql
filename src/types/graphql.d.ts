import { DocumentNode } from "graphql";

// Handles the .graphql Imports in typescript
declare module "*.graphql" {
  const Schema: DocumentNode;
  export = Schema;
}
