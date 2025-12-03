import React, { JSX } from "react";

export default function Pagination(): JSX.Element {
  return (
    <div className="flex justify-end">
      <div className="join custom-btn">
        <button className="join-item btn btn-sm">Previous</button>
        <button className="join-item btn btn-sm">1</button>
        <button className="join-item btn btn-active btn-sm ">2</button>
        <button className="join-item btn btn-sm">3</button>
        <button className="join-item btn btn-sm">4</button>
        <button className="join-item btn btn-sm">Next</button>
      </div>
    </div>
  );
}
