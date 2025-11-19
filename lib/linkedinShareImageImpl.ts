import path from "path";
import { promises as fs } from "fs";
import React from "react";
import { ImageResponse } from "next/og";

const TEMPLATE_PATH = path.join(process.cwd(), "public", "images", "linkedin_template.png");
const FONT_PATH = path.join(process.cwd(), "public", "fonts", "Inter-Bold.ttf");

const TEMPLATE_DIMENSIONS = { width: 1920, height: 1080 } as const;
const PROFILE_RECT = { x: 500, y: 240, width: 200, height: 200 } as const;
const PROFILE_NAME_BLOCK = { x: 1100, y: 240, gap: 48 } as const;
const NAME_CONFIG = {
  x: 1220,
  y: 490,
  maxWidth: 450,
  fontSize: 60,
  lineHeight: 56,
  color: "#ffffff",
} as const;

let templateDataUrlPromise: Promise<string> | null = null;
let fontDataPromise: Promise<ArrayBuffer | null> | null = null;

async function getTemplateDataUrl() {
  if (!templateDataUrlPromise) {
    templateDataUrlPromise = (async () => {
      const file = await fs.readFile(TEMPLATE_PATH);
      const base64 = file.toString("base64");
      return `data:image/png;base64,${base64}`;
    })();
  }
  return templateDataUrlPromise;
}

async function getFontData() {
  if (!fontDataPromise) {
    fontDataPromise = (async () => {
      try {
        const file = await fs.readFile(FONT_PATH);
        return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
      } catch (error) {
        return null;
      }
    })();
  }
  return fontDataPromise;
}

function normaliseName(name: string | null | undefined) {
  const trimmed = (name || "").trim();
  return trimmed || "Vigyan Mela Participant";
}

function sanitiseProfileUrl(url?: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch (error) {
    return null;
  }
}

type ImageResponseInit = ConstructorParameters<typeof ImageResponse>[1];
type ImageResponseOptions = Exclude<ImageResponseInit, undefined>;

export async function generateLinkedInShareImage({
  name,
  profileImageUrl,
}: {
  name: string;
  profileImageUrl?: string | null;
}) {
  const templateSrc = await getTemplateDataUrl();
  const fontData = await getFontData();
  const safeName = normaliseName(name);
  const safeProfileUrl = sanitiseProfileUrl(profileImageUrl);

  const element = React.createElement(
    "div",
    {
      style: {
        width: TEMPLATE_DIMENSIONS.width,
        height: TEMPLATE_DIMENSIONS.height,
        position: "relative",
        display: "flex",
        backgroundColor: "#000",
      },
    },
    React.createElement("img", {
      src: templateSrc,
      alt: "LinkedIn share template",
      style: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          left: PROFILE_NAME_BLOCK.x,
          top: PROFILE_NAME_BLOCK.y,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: PROFILE_NAME_BLOCK.gap,
          maxWidth: NAME_CONFIG.maxWidth + PROFILE_RECT.width + PROFILE_NAME_BLOCK.gap,
        },
      },
      safeProfileUrl
        ? React.createElement(
            "div",
            {
              style: {
                width: PROFILE_RECT.width,
                height: PROFILE_RECT.height,
                borderRadius: PROFILE_RECT.width / 2,
                overflow: "hidden",
                backgroundColor: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              },
            },
            React.createElement("img", {
              src: safeProfileUrl,
              alt: "Participant profile",
              style: {
                width: "100%",
                height: "100%",
                objectFit: "cover",
              },
            })
          )
        : null,
      React.createElement(
        "div",
        {
          style: {
            color: NAME_CONFIG.color,
            fontSize: NAME_CONFIG.fontSize,
            fontWeight: 900,
            lineHeight: `${NAME_CONFIG.lineHeight}px`,
            fontFamily: "'Inter', 'Arial', 'Helvetica', sans-serif",
            whiteSpace: "normal",
            wordWrap: "break-word",
            wordBreak: "break-word",
            maxWidth: NAME_CONFIG.maxWidth,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          },
        },
        safeName
      )
    )
  );

  const init: ImageResponseOptions = {
    width: TEMPLATE_DIMENSIONS.width,
    height: TEMPLATE_DIMENSIONS.height,
    fonts: fontData
      ? [
          {
            name: "Inter",
            data: fontData,
            weight: 700,
            style: "normal",
          },
        ]
      : undefined,
  };

  const imageResponse = new ImageResponse(element, init);

  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}