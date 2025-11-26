import React, { JSX } from "react";

export default function Mission(): JSX.Element {
  return (
    <div className="px-5 my-5">
      <h1 className="hidden text-lg font-medium text-accent md:text-left md:block">
        Vision and Mission
      </h1>
      <div className="flex flex-col md:flex-row">
        <div>
          <h1 className="text-xl font-medium text-center md:text-3xl text-primary md:text-left">
            Vision Statement
          </h1>
          <p className="my-2 tracking-wide text-text">
            To be a leading microfinance and investment institution recognized
            for empowering lives, promoting financial inclusion, and inspiring
            sustainable growth across every community we serve.
          </p>
        </div>
        <div>
          <h1 className="text-xl font-medium text-center md:text-3xl md:text-left text-primary">
            Mission Statement
          </h1>
          <p className="my-2 tracking-wide text-text">
            To deliver accessible financial services, promote savings culture,
            support entrepreneurs, and invest in the empowerment of individuals
            and businesses through innovative, ethical, and customer-focused
            solutions.
          </p>
        </div>
      </div>
    </div>
  );
}
