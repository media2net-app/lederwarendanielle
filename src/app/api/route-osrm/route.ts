import { NextRequest, NextResponse } from "next/server";

/** Coords: array of [lng, lat]. Returns legs: { distanceM, durationS }[] */
export async function GET(request: NextRequest) {
  const coordsParam = request.nextUrl.searchParams.get("coords");
  if (!coordsParam) {
    return NextResponse.json({ error: "coords required (lng,lat;lng,lat;...)" }, { status: 400 });
  }
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=false`;
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]?.legs) {
      return NextResponse.json(
        { error: data.message || "Geen route gevonden" },
        { status: 400 }
      );
    }
    const legs = data.routes[0].legs.map((leg: { distance: number; duration: number }) => ({
      distanceM: leg.distance,
      durationS: leg.duration,
    }));
    return NextResponse.json({ legs });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Route-aanvraag mislukt" },
      { status: 500 }
    );
  }
}
