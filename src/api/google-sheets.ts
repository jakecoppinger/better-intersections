import GSheetReader from "g-sheets-api";
import { FormResponse, IntersectionStats, TrafficLightReport } from "../types";
import {
  convertToTrafficLightReport,
  isValidTrafficLightReport,
  summariseReportsByIntersection,
} from "../utils/utils";


const options = {
  apiKey: "AIzaSyCr3HYpVAJ1iBlb_IjbK_KbltnC0T8C6hY",
  // This is a public Google Sheet, with results copied from a private sheet (excluding emails)
  sheetId: "1L08GNolPYjiRwLOL2d3lAZPqwCNe5vGr6SAOtH7hnNM",
  sheetName: "Sheet1",
  returnAllResults: true,
};
export function getDataFromSheet(): Promise<FormResponse[]> {
  return new Promise((resolve, reject) => {
    GSheetReader(
      options,
      (results: any) => {
        resolve(results);
      },
      (error: any) => {
        reject(error);
      }
    );
  });
}

export async function getIntersections(): Promise<IntersectionStats[]> {
  try {
  const data = await getDataFromSheet();

  const safeData = data.filter(
    (report) =>
      report[
      "Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)"
      ]
  );

  const reports: TrafficLightReport[] = await Promise.all(
    safeData
      .filter(isValidTrafficLightReport)
      .map(convertToTrafficLightReport)
  );
  const intersections: IntersectionStats[] =
    summariseReportsByIntersection(reports);
  return intersections;
  } catch(e) {
    alert('Unable to fetch data from Google Sheets. Please try again later or contact Jake.');
    // alert(JSON.stringify(e));
    return [];
  } 
}