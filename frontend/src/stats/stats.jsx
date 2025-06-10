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
      <div className="row row-cols-2 align-items-center">
        <div className="col">
          <h2 className="mb-4 text-light">Tough Crowd Meter</h2>
          <Speedometer min={-100} max={100} value={toughValue} startColor="#FFFF5F" endColor="#FF3A36"/>
        </div>
        <div className="col">
            <h4 className="text-light">Most Overrated Movies:</h4>
            <table className="table table-dark table-striped">
                <thead>
                    <tr>
                        <th><i>Movie</i></th>
                        <th><i>Avg. Rating</i></th>
                        <th><i>Your Rating</i></th>
                        <th><i>Difference</i></th>
                    </tr>
                </thead>

            </table>
        </div>
    </div>
    <div className="row row-cols-2">
        <div className="col">
          <h2 className="mt-5 mb-4 text-light">Obscurity Meter</h2>
          <Speedometer
            min={0}
            max={100}
            value={obscureValue}
            endColor="#01e154"
            startColor="#444"
          />
        </div>
        <div className="col">
            list
        </div>
      </div>
    </div>
  );
}
