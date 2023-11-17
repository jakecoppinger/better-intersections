import { FunctionComponent, useState } from "react";
import { getIntersectionMeasurements } from "../api/db";

export const JsonExport: FunctionComponent = () => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const downloadCsv = async () => {
    try {
      const data = await getIntersectionMeasurements();

      const fileContent = JSON.stringify(data, null, 2);

      const blob = new Blob([fileContent], {
        type: "application/json;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "measurements_export.json";
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
      {downloadStarted
        ? "JSON download complete"
        : "Download measurements JSON"}
    </button>
  );
};
