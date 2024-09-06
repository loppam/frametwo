/** @jsxImportSource frog/jsx */
import { Button, Frog } from "frog";
import { handle } from "frog/next";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
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
  const q = query(artCollection, limit(10)); // Fetch 10 documents and pick a random one
  const querySnapshot = await getDocs(q);
  const artList = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const randomIndex = Math.floor(Math.random() * artList.length);
  const randomArt = artList[randomIndex];
  if (querySnapshot.empty) {
    throw new Error("No art found");
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();

  // Ensure type safety with TypeScript
  const art: Art = {
    id: doc.id,
    name: data.name,
    imageUrl: data.imageUrl,
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
        <Button action="/art">Next Art</Button>,
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
          }}
        >
          Error fetching art. Please try again.
        </div>
      ),
      intents: [<Button action="/">Back</Button>],
    });
  }
});

// Export the Frog app handlers for GET and POST requests
export const GET = handle(app);
export const POST = handle(app);
