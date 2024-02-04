import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") ?? "ADE"

  const energizeLogoWhiteImageData = await fetch(
    new URL("../../../public/logos/energize-white-square.png", import.meta.url)
  ).then((res) => res.arrayBuffer())

  const boldFontP = fetch(
    new URL("../../../assets/fonts/Geist-Bold.otf", import.meta.url)
  ).then((res) => res.arrayBuffer())

  const regularFontP = fetch(
    new URL("../../../assets/fonts/Geist-Regular.otf", import.meta.url)
  ).then((res) => res.arrayBuffer())

  const semiBoldFontP = fetch(
    new URL("../../../assets/fonts/Geist-SemiBold.otf", import.meta.url)
  ).then((res) => res.arrayBuffer())

  const [boldFont, regualrFont, semiBoldFont] = await Promise.all([
    boldFontP,
    regularFontP,
    semiBoldFontP,
  ])

  const sharedOptions: ConstructorParameters<typeof ImageResponse>[1] = {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Geist",
        data: boldFont,
        style: "normal",
        weight: 700,
      },
      {
        name: "Geist",
        data: regualrFont,
        style: "normal",
        weight: 400,
      },
      {
        name: "Geist",
        data: semiBoldFont,
        style: "normal",
        weight: 600,
      },
    ],
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          fontSize: 80,
          fontWeight: 600,
          color: "white",
          backgroundColor: "black",
          fontFamily: '"Geist"',
          background:
            "linear-gradient(to left, rgb(0,0,0) 0%, rgb(0,0,60) 50%, rgb(0,0,0) 100%)",
          width: "1200px",
          height: "630px",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          width="100"
          height="100"
          src={energizeLogoWhiteImageData as unknown as string}
        />
        <p tw="mb-0">{title}</p>
      </div>
    ),
    sharedOptions
  )
}
