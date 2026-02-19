import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.alternative.me/fng/");
    const data = await response.json();
    
    if (data.data && data.data[0]) {
      return NextResponse.json({
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
      });
    }
    
    return NextResponse.json({ value: 50, classification: "Neutral" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ value: 50, classification: "Neutral" });
  }
}
