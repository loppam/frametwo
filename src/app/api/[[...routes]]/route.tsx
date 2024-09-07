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

  return randomArt;
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

    const encodedArt = encodeURIComponent(JSON.stringify(art));
    const shareUrl = `/share?art=${encodedArt}`;

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
  const encodedArt = searchParams.get('art');
  let currentArt: Art | null = null;

  if (encodedArt) {
    try {
      currentArt = JSON.parse(decodeURIComponent(encodedArt)) as Art;
    } catch (error) {
      console.error("Error parsing art data:", error);
    }
  }

  const debugInfo = `
    Full URL: ${c.url}
    Encoded Art: ${encodedArt || 'Not found'}
    Decoded Art: ${JSON.stringify(currentArt, null, 2)}
  `;

  if (!currentArt || !currentArt.imageUrl) {
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
          <h2 style={{ color: "red" }}>Error: No art information found</h2>
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
          src={currentArt.imageUrl}
          alt={currentArt.name}
          style={{ maxWidth: "80%", maxHeight: "60%" }}
        />
        <p>{currentArt.name}</p>
        <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {debugInfo}
        </pre>
      </div>
    ),
    intents: [
      <Button.Reset>Cancel</Button.Reset>,
      <Button.Link href={`https://warpcast.com/~/compose?text=Check out this amazing art: ${encodeURIComponent(currentArt.name)}&embeds[]=${encodeURIComponent(c.url)}`}>
        Share on Warpcast
      </Button.Link>,
    ],
  });
});

// Export the Frog app handlers for GET and POST requests
export const GET = handle(app);
export const POST = handle(app);
