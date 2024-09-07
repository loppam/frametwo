/** @jsxImportSource frog/jsx */
/* eslint-disable react/jsx-key */
/* eslint-disable @next/next/no-img-element */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../../components/Firebase";

// Define the type for the art data fetched from Firestore
type Art = {
  id: string;
  name: string;
  imageUrl: string;
};

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
  title: "Fetch Art Data",
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": "1765e8aa5090e480aa53fb9f3955c6dbb",
      },
    },
  },
});

// Function to fetch a random art piece from Firestore
async function fetchRandomArt(): Promise<Art> {
  const artCollection = collection(db, "art");
  const querySnapshot = await getDocs(artCollection);
  
  if (querySnapshot.empty) {
    throw new Error("No art found");
  }
  const artList = querySnapshot.docs.map((doc) => ({
    ...doc.data() as Art, // Cast data to Art type
    id: doc.id, // Moved id after spread to avoid overwriting
  }));

  const randomIndex = Math.floor(Math.random() * artList.length);
  const randomArt = artList[randomIndex];

  // Ensure type safety with TypeScript
  const art: Art = {
    id: randomArt.id,
    name: randomArt.name,
    imageUrl: randomArt.imageUrl,
  };

  return art;
}

// Home frame
app.frame("/", async (c) => {
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

    if (!art || !art.imageUrl) {
      throw new Error("Invalid art data");
    }

    const shareUrl = `/share?id=${encodeURIComponent(art.id)}&name=${encodeURIComponent(art.name)}&imageUrl=${encodeURIComponent(art.imageUrl)}`;

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
          <p style={{ fontSize: "0.8rem" }}>Share URL: {shareUrl}</p>
        </div>
      ),
      intents: [
        <Button action="/">Back</Button>,
        <Button action={shareUrl}>Share</Button>,
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
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "2rem",
            backgroundColor: "black",
          }}
        >
          Error fetching art. Please try again.
        </div>
      ),
      intents: [<Button action="/">Back</Button>],
    });
  }
});

// Share frame
app.frame("/share", async (c) => {
  const { searchParams } = new URL(c.url);
  const id = searchParams.get('id');
  const name = searchParams.get('name');
  const imageUrl = searchParams.get('imageUrl');

  const debugInfo = `
    Full URL: ${c.url}
    ID: ${id || 'Not found'}
    Name: ${name || 'Not found'}
    Image URL: ${imageUrl || 'Not found'}
  `;

  if (!id || !name || !imageUrl) {
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
          textAlign: "left",
        }}>
          <h2 style={{ color: "red" }}>Error: Missing art information</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {debugInfo}
          </pre>
        </div>
      ),
      intents: [<Button action="/">Back to Home</Button>],
    });
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
          fontSize: "1rem",
          padding: "20px",
        }}
      >
        <img
          src={decodeURIComponent(imageUrl)}
          alt={decodeURIComponent(name)}
          style={{ maxWidth: "80%", maxHeight: "60%" }}
        />
        <p>{decodeURIComponent(name)}</p>
        <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {debugInfo}
        </pre>
      </div>
    ),
    intents: [
      <Button.Reset>Cancel</Button.Reset>,
      <Button.Link href={`https://warpcast.com/~/compose?text=Check out this amazing art: ${encodeURIComponent(name)}&embeds[]=${encodeURIComponent(c.url)}`}>
        Share on Warpcast
      </Button.Link>,
    ],
  });
});

// Export the Frog app handlers for GET and POST requests
export const GET = handle(app);
export const POST = handle(app);
