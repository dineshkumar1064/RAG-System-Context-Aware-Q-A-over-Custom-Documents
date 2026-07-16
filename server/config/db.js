import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }
  await mongoose.connect(uri);
  console.log("[db] connected to MongoDB");
  await dropStaleIndexes();
}

/**
 * Drops indexes that exist on the `documents` collection in MongoDB but are no
 * longer declared in the current Mongoose schema (e.g. a leftover unique index
 * on a field like `docId` from an earlier version of the schema). Stale unique
 * indexes on a field that's always `undefined`/`null` cause spurious
 * E11000 duplicate key errors on every insert after the first.
 */
async function dropStaleIndexes() {
  try {
    const collection = mongoose.connection.collection("documents");
    const existing = await collection.indexes();
    const schemaFields = new Set(["_id", "filename", "mimetype", "chunkCount", "createdAt"]);

    for (const idx of existing) {
      const [indexedField] = Object.keys(idx.key);
      if (indexedField !== "_id" && !schemaFields.has(indexedField)) {
        console.log(`[db] dropping stale index "${idx.name}" (field "${indexedField}" not in current schema)`);
        await collection.dropIndex(idx.name);
      }
    }
  } catch (err) {
    if (err.codeName !== "NamespaceNotFound") {
      console.error("[db] index cleanup skipped:", err.message);
    }
  }
}