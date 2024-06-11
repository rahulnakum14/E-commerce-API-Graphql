//Defaults
import mongoose from "mongoose";

/**
 * Connects to the MongoDB database.
 *
 * @property {string} url - The MongoDB connection URL.
 * @property {string} dbName - The name of the database to connect to.
 * @returns {Promise<void>} A promise that resolves when the connection is established,
 */
export const connectDb = async () => {
  try {
    var url =
      "mongodb+srv://rahuln:HTV5MiJqrFO5ytZh@cluster0.zwjsixq.mongodb.net/";

    await mongoose.connect(url, {
      dbName: "ecommerce",
    });

    mongoose.connection.once("open", () => {
      console.log("Connected to MongoDB");
    });

    mongoose.connection.on("error", (error) => {
      console.error("Database connection error:", error);
    });
  } catch (error) {
    let errorMessage = "Error Connecting to the mongodb connection.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log(errorMessage);
  }
};
