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
    const url = process.env.MONGO_URL || "mongodb://localhost:27017/ecommerce";

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
    let errorMessage = "Error Connecting to the MongoDB connection.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log(errorMessage);
  }
};

// export const connectDb = async () => {
//   try {
//     var url =
//       "mongodb://mongodb:27017/your_database_name";

//     await mongoose.connect(url, {
//       dbName: "ecommerce",
//     });

//     mongoose.connection.once("open", () => {
//       console.log("Connected to MongoDB");
//     });

//     mongoose.connection.on("error", (error) => {
//       console.error("Database connection error:", error);
//     });
//   } catch (error) {
//     let errorMessage = "Error Connecting to the mongodb connection.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     console.log(errorMessage);
//   }
// };
