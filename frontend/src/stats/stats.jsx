import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Speedometer from "../speedometer/speedometer";

export default function Stats() {
  const [toughValue, setToughValue] = useState(33);
  const [obscureValue, setObscureValue] = useState(75);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const res = await axios.get('/api/meters');
//         setToughValue(res.data.toughCrowd);     // e.g. 62
//         setObscureValue(res.data.obscurity);    // e.g. 35
//       } catch {
//         setToughValue(60);
//         setObscureValue(40);
//       }
//     }
//     fetchData();
//   }, []);

  return (
    <div className="container text-center">
      <h2 className="mb-4 text-light">Tough Crowd Meter</h2>
      <Speedometer min={0} max={100} value={toughValue} />

      <h2 className="mt-5 mb-4 text-light">Obscurity Meter</h2>
      <Speedometer
        min={0}
        max={100}
        value={obscureValue}
        endColor="#01e154"
        startColor="#444"
      />
    </div>
  );
}
