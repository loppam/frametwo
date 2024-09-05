/** @jsxImportSource frog/jsx */
/* eslint-disable */
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { fetchArtData } from "../fetch/fetchDetails";

const app = new Frog({
  assetsPath: "/",
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
  title: "fetch art data",
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": "1765e8aa5090e480aa53fb9f3955c6dbb",
      },
    },
  },
});

app.frame("/second", async (c) => {
  const { frameData, verified } = c;

  // Debug logs
  console.log("frameData:", frameData);
  console.log("verified:", verified);

  // Check if frameData is valid
  if (!frameData || !frameData.fid || !frameData.castId || !verified) {
    console.log("Verification failed: Invalid frame data");
    return c.res({
      action: "/",
      image: (
        <div
          style={{
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "black",
            fontSize: "2rem",
          }}
        >
          Verification failed: Invalid frame data
        </div>
      ),
      intents: [<Button>Back</Button>],
    });
  }

  // Frame is valid, proceed with fetching art data
  const { fid } = frameData as { fid: number };

  try {
    const artData = await fetchArtData(fid);

    return c.res({
      action: "/",
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
            src={artData.imageUrl}
            alt="Random Push Art"
            style={{ maxWidth: "80%", maxHeight: "70%" }}
          />
          <p>{artData.title}</p>
        </div>
      ),
      intents: [<Button>Back</Button>, <Button>Next Art</Button>],
    });
  } catch (error) {
    console.error("Error fetching art data:", error);
    return c.res({
      action: "/",
      image: (
        <div
          style={
            {
              /* ... error styles ... */
            }
          }
        >
          Error fetching art data. Please try again.
        </div>
      ),
      intents: [<Button>Back</Button>],
    });
  }
});

app.frame("/", (c) => {
  return c.res({
    action: "/second",
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
    intents: [
      <Button>Go</Button>,
      <Button.Link href="https://warpcast.com/push-">Follow Push</Button.Link>,
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
