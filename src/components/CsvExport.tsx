import React, { FunctionComponent } from "react";
import styled from "@emotion/styled";
import { getIntersectionMeasurements } from "../api/db";

const CsvDownload = styled.button`
  background: none;
  padding: 0px;
  color: blue;
  margin-left: 5px;
`;

export const CsvExport: FunctionComponent = () => {
  const downloadCsv = async () => {
    try {
      const data = await getIntersectionMeasurements();

      const csvData: string[] = [];
      const headers = Object.keys(data[0]);

      csvData.push(headers.join(","));

      data.forEach((v) => {
        const csvRow = Object.values(v).map((x) => {
          return typeof x === "string" ? x.replace(/,/g, "") : x;
        });
        csvData.push(csvRow.join(","));
      });

      const downloadDate = csvData.join("\n");

      const blob = new Blob([downloadDate], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "measurements_export.csv";
      link.click();
      link.remove();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <CsvDownload onClick={downloadCsv}>
        <u>Measurements Export</u>
      </CsvDownload>
    </>
  );
};
