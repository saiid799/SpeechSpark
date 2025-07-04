import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  const resolvedParams = await params;
  const word = resolvedParams.word;

  // This is a placeholder. In a real app, you'd use a text-to-speech service here.
  const audioBuffer = Buffer.from(word);

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length.toString(),
    },
  });
}
