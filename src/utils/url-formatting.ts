
export function googleStreetViewUrl(latitude: number, longitude: number): string {
  const pitch: number = 0;
  const fieldOfView: number = 90;
  const heading: number = 0;

  const url: string = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}&heading=${heading}&pitch=${pitch}&fov=${fieldOfView}`;

  return url;
}

export function generateGeohackQueryParam({
  lat,
  lon,
}: {
  lat: number;
  lon: number;
}): string {
  // eg. https://geohack.toolforge.org/geohack.php?params=33_53_0_S_151_12_29_E
  const latSign = lat > 0 ? 1 : -1;
  const lonSign = lon > 0 ? 1 : -1;
  const northSouth = lat > 0 ? "N" : "S";
  const eastWest = lon > 0 ? "E" : "W";

  const positiveLat = lat * latSign;
  const lat1 = Math.floor(positiveLat);
  const lat2 = Math.floor((positiveLat - lat1) * 60);
  const lat3 = Math.floor((positiveLat - lat1 - lat2 / 60) * 3600);

  const positiveLon = lon * lonSign;
  const lon1 = Math.floor(positiveLon);
  const lon2 = Math.floor((positiveLon - lon1) * 60);
  const lon3 = Math.floor((positiveLon - lon1 - lon2 / 60) * 3600);

  let p = lat1 + "_" + lat2 + "_" + lat3 + "_" + northSouth + "_";
  p += lon1 + "_" + lon2 + "_" + lon3 + "_" + eastWest;
  return p;
}