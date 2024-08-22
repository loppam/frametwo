/** @jsxImportSource frog/jsx */

import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { Jersey_10 } from "next/font/google";
const jersey_10 = Jersey_10({
  subsets: ["latin"],
  weight: "400",
});
const app = new Frog({
  assetsPath: "/",
  basePath: "/api",

  title: "get fid color",
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": "1765e8aa5090e480aa53fb9f3955c6dbb",
      },
    },
  },
});

app.frame("/second", (c) => {
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
      intents: [<Button>back</Button>],
    });
  }

  // Frame is valid, proceed with the intended action
  const { fid } = frameData as { fid: number };

  console.log("fid:", fid);

  return c.res({
    action: "/",
    image: (
      <div
        style={{
          color: `white`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: `#${fid}`,
          fontFamily: `jersey_10`,
          fontSize: "3rem",
        }}
      >
        Your fid color is: #{fid}
      </div>
    ),
    intents: [<Button>back</Button>],
  });
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
        Get FID Color
      </div>
    ),
    intents: [<Button>go</Button>],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
