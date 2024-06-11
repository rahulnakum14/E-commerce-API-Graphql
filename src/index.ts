import express, { Application } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import resolvers from "./graphql/resolvers";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import typeDefs from "./graphql/schema";
import { connectDb } from "./config/db";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  await connectDb();

  app.use("/graphql", cors(), express.json(), expressMiddleware(server));

  const PORT = process.env.PORT || 4000;
  httpServer.listen({ port: PORT });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});

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
