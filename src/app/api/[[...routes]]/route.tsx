/** @jsxImportSource frog/jsx */
/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { collection, getDocs } from "firebase/firestore";
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
async function fetchRandomArt(): Promise<{
  art: Art;
  name: string;
  imageUrl: string;
}> {
  const artCollection = collection(db, "art");
  const querySnapshot = await getDocs(artCollection);

  if (querySnapshot.empty) {
    throw new Error("No art found");
  }
  const artList = querySnapshot.docs.map((doc) => ({
    ...(doc.data() as Art),
    id: doc.id,
  }));

  const randomIndex = Math.floor(Math.random() * artList.length);
  const randomArt = artList[randomIndex];

  // Only cache the art if it's not already cached
  if (!artCache.has(randomArt.name)) {
    artCache.set(randomArt.name, {
      ...randomArt,
      imageUrl: randomArt.imageUrl,
    });
  }

  return { art: randomArt, name: randomArt.name, imageUrl: randomArt.imageUrl }; // Return art, name, and image URL
}

// Home frame
app.frame("/", (c) => {
  // Clear the cache when returning to the home frame
  artCache.clear();

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

app.frame("/art", async (c) => {
  const queryParams = c.req.query(); // Access query parameters
  const artId = queryParams.id; // Extract 'id' from the query parameters
  let art;

  if (artId && artCache.has(artId)) {
    // Fetch the cached art using the ID from the query string
    art = artCache.get(artId);
  } else if (artId) {
    // If artId is present but not cached, fetch from Firestore
    const artCollection = collection(db, "art");
    const querySnapshot = await getDocs(artCollection);
    const artList = querySnapshot.docs.map((doc) => ({
      ...(doc.data() as Art),
      id: doc.id,
    }));
    art = artList.find((a) => a.id === artId);

    // Cache the art if found
    if (art) {
      artCache.set(art.id, art);
    }
  } else {
    // If no artId is provided, fetch a random art piece
    const randomArtData = await fetchRandomArt();
    art = randomArtData.art;

    // Cache the fetched art piece
    artCache.set(art.id, art);
  }

  // Handle case where 'art' is undefined
  if (!art) {
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
          <p>Error: Art not found. Please try again.</p>
        </div>
      ),
      intents: [<Button action="/">Back</Button>],
    });
  }

  // Text for sharing
  const shareText = `Check out this Random art thanks @push-`;
  // Embed the art ID in the URL to ensure the same art is displayed after sharing
  const frameUrl = `${c.url}?id=${art.id}`;

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
        {/* <p>Note: This is not your Random art, You get yours on share</p> */}
      </div>
    ),
    intents: [
      <Button action="/">Back</Button>,
      <Button.Link
        href={`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${frameUrl}`}
      >
        Share on Warpcast
      </Button.Link>,
      <Button.Link href="https://warpcast.com/push-">Follow Push</Button.Link>,
    ],
  });
});

// Export the Frog app handlers for GET and POST requests
export const GET = handle(app);
export const POST = handle(app);
