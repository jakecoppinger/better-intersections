import { useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import React from "react";

export async function nodeIdLoader({ params }: LoaderFunctionArgs) {
  const nodeId = params.nodeId;
  return { nodeId };
}

export default function IntersectionNodePage() {
  const { nodeId } = useLoaderData() as { nodeId: string | undefined };
  return (
    <div>
      <h1>Intersection {nodeId} </h1>
    </div>
  );
}
