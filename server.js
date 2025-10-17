// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { auth, db } from "./firebase.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// root route so you don’t see “Cannot GET /”
app.get("/", (req, res) => res.send("🔥 n0t backend is live"));

// ✅ Register user
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // create Firebase user
    const user = await auth.createUser({ email, password });

    // store Firestore doc
    await db.collection("users").doc(user.uid).set({
      email,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ id: user.uid, displayName: email });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login (basic lookup)
app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    const snap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snap.empty) return res.status(404).json({ error: "User not found" });

    const user = snap.docs[0];
    res.json({ id: user.id, displayName: email });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Error logging in" });
  }
});

// ✅ Fetch notes
app.get("/notes/:uid", async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .doc(req.params.uid)
      .collection("notes")
      .orderBy("date", "desc")
      .get();

    const notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(notes);
  } catch (err) {
    console.error("Fetch Notes Error:", err.message);
    res.status(500).json({ error: "Error fetching notes" });
  }
});

// ✅ Add note
app.post("/notes/:uid", async (req, res) => {
  try {
    const { text } = req.body;
    const { uid } = req.params;

    const ref = await db
      .collection("users")
      .doc(uid)
      .collection("notes")
      .add({ text, date: new Date().toISOString() });

    res.status(201).json({ id: ref.id, text, date: new Date().toISOString() });
  } catch (err) {
    console.error("Save Note Error:", err.message);
    res.status(500).json({ error: "Error saving note" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🔥 n0t backend running at http://127.0.0.1:${PORT}`)
);
