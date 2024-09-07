/** @jsxImportSource frog/jsx */
/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../components/Firebase";

// Define the type for the art data
type Art = {
  id: string;
  name: string;
  imageUrl: string;
};

// Create a cache to store the art data
const artCache = new Map<string, Art>();

// Initialize Frog app
const app = new Frog({
  basePath: "/api",
  imageOptions: {
    fonts: [
      {
        name: "Open Sans",
        weight: 400,
        source: "google",
      },
    ],
  },
  title: "Random Art Share",
});

// Function to fetch a random art piece from Firestore
async function fetchRandomArt(): Promise<Art> {
  const artCollection = collection(db, "art");
  const querySnapshot = await getDocs(artCollection);
  
  if (querySnapshot.empty) {
    throw new Error("No art found");
  }
  const artList = querySnapshot.docs.map((doc) => ({
    ...doc.data() as Art,
    id: doc.id,
  }));

  const randomIndex = Math.floor(Math.random() * artList.length);
  const randomArt = artList[randomIndex];

  // Cache the art using its name as the key
  artCache.set(randomArt.name, randomArt);

  return randomArt;
}

// Function to fetch art by name from Firestore
async function fetchArtByName(name: string): Promise<Art | null> {
  // Check cache first
  if (artCache.has(name)) {
    return artCache.get(name)!;
  }

  // If not in cache, fetch from Firestore
  const artCollection = collection(db, "art");
  const q = query(artCollection, where("name", "==", name));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const art = { ...doc.data() as Art, id: doc.id };

  // Cache the fetched art
  artCache.set(name, art);

  return art;
}
const cachekeys = Array.from(artCache.keys()).join(", ");
// Home frame
app.frame("/", (c) => {
  return c.res({
    image: (
      <div
        style={{
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "2rem",
        }}
      >
        Get your random Push art
      </div>
    ),
    intents: [<Button action="/art">Go</Button>],
  });
});

// Art display frame
app.frame("/art", async (c) => {
  try {
    const art = await fetchRandomArt();

    if (!art || !art.imageUrl || !art.name) {
      throw new Error("Invalid art data");
    }

    return c.res({
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "black",
            color: "white",
            fontSize: "1.5rem",
          }}
        >
          <img
            src={art.imageUrl}
            alt={art.name}
            style={{ maxWidth: "80%", maxHeight: "70%" }}
          />
          <p>{art.name}</p>
        </div>
      ),
      intents: [
        <Button action="/">Back</Button>,
        <Button action={`/share?name=${encodeURIComponent(art.name)}`}>Share</Button>,
      ],
    });
  } catch (error) {
    console.error("Error fetching art:", error);
    return c.res({
      image: (
        <div
          style={{
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "1.5rem",
            backgroundColor: "black",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <p>Error fetching art. Please try again.</p>
          <p>Cache keys: {Array.from(artCache.keys()).join(", ")}</p>
        </div>
      ),
      intents: [<Button action="/">Back</Button>],
    });
  }
});


// Share frame
app.frame("/share", async (c) => {
  const artName = c.req.query("name");
  
  if (typeof artName !== 'string') {
    return c.res({
      image: (
        <div style={{
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1rem",
          backgroundColor: "black",
          padding: "20px",
          textAlign: "center",
        }}>
          <h2 style={{ color: "red" }}>Error: Invalid art name</h2>
          <p>Cache keys: {Array.from(artCache.keys()).join(", ")}</p>
        </div>
      ),
      intents: [<Button action="/">Back to Home</Button>],
    });
  }

  // const decodedArtName = decodeURIComponent(artName);
  const art = await fetchArtByName(cachekeys);
  
  if (!art) {
    return c.res({
      image: (
        <div style={{
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1rem",
          backgroundColor: "black",
          padding: "20px",
          textAlign: "center",
        }}>
          <h2 style={{ color: "red" }}>Error: Art not found</h2>
          <p>Requested art name: {cachekeys}</p>
          <p>Cache keys: {cachekeys}</p>
        </div>
      ),
      intents: [<Button action="/">Back to Home</Button>],
    });
  }
  const shareText = `Check out this amazing art: ${art.name}`;
  const frameUrl = `${c.url}/api`;

  return c.res({
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "black",
          color: "white",
          fontSize: "1rem",
          padding: "20px",
        }}
      >
        <img
          src={art.imageUrl}
          alt={art.name}
          style={{ maxWidth: "80%", maxHeight: "60%" }}
        />
        <p>{art.name}</p>
        <p>Ready to share?</p>
      </div>
    ),
    intents: [
      <Button action="/">Cancel</Button>,
      <Button action="post">Share on Warpcast</Button>,
    ],
  });
});

// Handle post action
app.post("/share", async (c) => {
  const artName = c.req.query("name");
  if (typeof artName !== 'string') {
    return c.json({ message: "Invalid art name" }, { status: 400 });
  }

  const decodedArtName = decodeURIComponent(artName);
  const art = await fetchArtByName(decodedArtName);
  if (!art) {
    return c.json({ message: "Art not found" }, { status: 404 });
  }
  const shareText = `Check out this amazing art: ${art.name}`;
  // const frameUrl = `${c.req.url.origin}/api`;

  return c.json({
    cast: shareText,
    // frames: [frameUrl],
  });
});

// Export the Frog app handlers for GET and POST requests
export const GET = handle(app);
export const POST = handle(app);
