import { mockOverpassSignalSiteResponse } from "./mock-overpas-response";
import { getSiteDetailsForNodeId } from "./utils";

describe("getSiteDetailsForNodeId", () => {
  it("should return the site details for a given node id", async () => {
    const siteDetails = await getSiteDetailsForNodeId({
      trafficSignalOsmNodeId:
        11280772099, overpassResponse: mockOverpassSignalSiteResponse
    });
    expect(siteDetails).toBeDefined();

    expect(siteDetails?.operator).toBe("Transport for NSW");
    expect(siteDetails?.ref).toBe(414);
  });
  it("should return undefined if the node id is not a traffic signal site", async () => {
    const siteDetails = await getSiteDetailsForNodeId({
      trafficSignalOsmNodeId: 1234567890,
      overpassResponse: mockOverpassSignalSiteResponse
    });
    expect(siteDetails).toBeUndefined();
  });
});