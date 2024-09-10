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

  // Cache the art using its name as the key, including the image URL
  artCache.set(randomArt.name, { ...randomArt, imageUrl: randomArt.imageUrl });

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

// Art display frame
app.frame("/art", async (c) => {
  try {
    const { art, imageUrl } = await fetchRandomArt(); // Destructure to get art, name, and image URL

    if (!art.imageUrl || !art.name) {
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
            src={imageUrl} // Use the cached image URL
            // alt={art.name}
            style={{ maxWidth: "80%", maxHeight: "70%" }}
          />
          <p>{art.name}</p>
        </div>
      ),
      intents: [
        <Button action="/">Back</Button>,
        <Button action={`/share?name=${encodeURIComponent(imageUrl)}`}>
          Share
        </Button>, // Use the exported name
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
          <p>Current cache keys: {Array.from(artCache.keys()).join(", ")}</p>
        </div>
      ),
      intents: [<Button action="/">Back</Button>],
    });
  }
});

// Share frame
app.frame("/share", async (c) => {
  const { art, imageUrl } = await fetchRandomArt();
  const shareText = `Check out this amazing art Name: ${art.name}`;

  const origin = c.req.header("origin") || "https://frametwo.vercel.app/";
  const frameUrl = `${origin}/api`;

  // const frameUrl = `${c.req.header("origin")}/api`;
  try {
    if (!imageUrl) {
      throw new Error("Url not found");
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
            src={art.imageUrl} // Use the cached image URL
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
        // <Button.Link href={`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(cacheBustedUrl)}`}></Button.Link>
        <Button.Link
          href={`https://warpcast.com/~/compose?text=${shareText}&embeds[]=${frameUrl}`}
        >
          Share on Warpcast
        </Button.Link>,
      ],
    });
    //     return c.res({
    //       image: (
    //         <div style={{
    //           color: "white",
    //           display: "flex",
    //           flexDirection: "column",
    //           justifyContent: "center",
    //           alignItems: "center",
    //           height: "100vh",
    //           fontSize: "1rem",
    //           backgroundColor: "black",
    //           padding: "20px",
    //           textAlign: "center",
    //         }}>
    // <img src={imageUrl} style={{maxWidth: "80%", maxHeight: "70%"}}/>
    //         </div>
    //       ),
    //       intents: [<Button action="/">Back to Home</Button>],
    //     });

    // const decodedArtName = decodeURIComponent(artName);

    // Retrieve the art from the cache
    // const art = artCache.get(decodedArtName);
  } catch (error) {
    console.error("cant find cached url:", error);
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
            fontSize: "1rem",
            backgroundColor: "black",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "red" }}>Error: cached url not found</h2>
          <p>current cache url :{imageUrl}</p>
          <p>Current cache keys: {Array.from(artCache.keys()).join(", ")}</p>
        </div>
      ),
      intents: [<Button action="/">Back to Home</Button>],
    });
  }
});

// Handle post action
// app.post("/share", async (c) => {
//   const { art, imageUrl } = await fetchRandomArt();

//   if (!imageUrl) {
//     return c.json({ message: "URL not found" });
//   }

//   if (!art) {
//     return c.json({ message: "Art not found" });
//   }

//   // const frameUrl = `${c.req.header("origin")}/api`; // Use request header to get the origin

//   return c.json({
//     cast: shareText,
//     // frames: [frameUrl],
//   });
// });

// Export the Frog app handlers for GET and POST requests
export const GET = handle(app);
export const POST = handle(app);
