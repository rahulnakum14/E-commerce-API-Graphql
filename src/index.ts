import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import resolvers from "./graphql/resolvers";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import typeDefs from "./graphql/schema";
import { connectDb } from "./config/db";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import AuthMiddleware from "./middlewares/auth";
import { ApolloError } from "apollo-server-errors";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import permissions from "./graphql/rules/permission";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const startServer = async () => {
  // Create an executable schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Apply graphql-shield middleware to the schema
  const schemaWithMiddleware = applyMiddleware(schema, permissions);

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  await connectDb();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return await AuthMiddleware.authenticateToken(req);
      },
    })
  );

  const PORT = process.env.PORT || 4000;
  httpServer.listen({ port: PORT }, () => {
    console.log(`Server is running on http://localhost:${PORT}/graphql`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});

/**New Working Code */
// const app = express();
// const httpServer = http.createServer(app);

// const startServer = async () => {
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
//   });

//   await server.start();
//   await connectDb();

//   app.use(
//     "/graphql",
//     cors(),
//     express.json(),
//     expressMiddleware(server, {
//       context: async ({ req }) => {
//         return await AuthMiddleware.authenticateToken(req)
//       }
//     })
//   );

//   const PORT = process.env.PORT || 4000;
//   httpServer.listen({ port: PORT }, () => {
//     console.log(`Server is running on http://localhost:${PORT}/graphql`);
//   });
// };

// startServer().catch((error) => {
//   console.error("Failed to start server:", error);
// });

/** Old Code Working */
// import express, { Application } from "express";
// import { ApolloServer } from "apollo-server-express";
// import resolvers from "./graphql/resolvers";
// import typeDefs from "./graphql/schema";
// import { connectDb } from "./config/db";
// import dotenv from "dotenv";

// dotenv.config();

// const startServer = async () => {
//   const app: Application = express();

//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//   await server.start();

//   await connectDb();

//   server.applyMiddleware({ app: app as any,  path: "/graphql" });

//   const PORT = process.env.PORT || 4000;

//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// };

// startServer().catch((error) => {
//   console.error("Failed to start server:", error);
// });
