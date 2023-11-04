import { FunctionComponent, useState,  } from "react";
import { getIntersectionMeasurements } from "../api/db";

/**
 * If a field contains a comma, it needs to be wrapped in quotes.
 * If a field contains a quote, it needs to be escaped with another quote.
 */
export function normaliseField(field: string): string {
  if (field.includes(",") || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export const CsvExport: FunctionComponent = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const downloadCsv = async () => {
    try {
      const data = await getIntersectionMeasurements();

      const csvData: string[] = [];
      const headers = Object.keys(data[0]);

      csvData.push(headers.join(","));

      data.forEach((v) => {
        const csvRow = Object.values(v).map((x: string) => {
          return typeof x === "string" ? normaliseField(x) : x;
        });
        csvData.push(csvRow.join(","));
      });

      const fileContent = csvData.join("\n");

      const blob = new Blob([fileContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "measurements_export.csv";
      link.click();
      link.remove();
      setDownloadStarted(true);
    } catch (error) {
      console.error(error);
      alert("Error downloading. Please try again or contact author.");
      setDownloadStarted(false);
    }
  };
  return (
    <button
      style={{
        display: "block",
        marginTop: "10px",
        marginBottom: "10px",
      }}
      onClick={downloadCsv}
      disabled={downloadStarted}
    >
      {downloadStarted ? "CSV download complete" : "Download measurements CSV"}
    </button>
  );
};
