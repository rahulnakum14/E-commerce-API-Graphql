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

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const { operationName, query } = req.body;

        // console.log('this is operation name',operationName);
        // console.log('this is query', query);
        
        // List of operations that do not require authentication
        const publicOperations = ['LoginUser', 'RegisterUser','VerifyEmail'];
        
        // Check for introspection query or public operations
        if (
          publicOperations.includes(operationName) ||
          query.includes('__schema')
        ) {
          return {}; // Skip authentication
        }

        // Proceed with authentication for other operations
        const authResult = await AuthMiddleware.authenticateToken(req);
        if ('error' in authResult) {
          throw new ApolloError(authResult.error, 'UNAUTHENTICATED');
        }
        return { user: authResult.user };
      }
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