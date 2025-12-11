import React, { JSX } from "react";

type ErrorProps = {
  error?: string;
};

export default function Error({ error }: ErrorProps): JSX.Element {
  return <span className="text-red-500">{error}</span>;
}
