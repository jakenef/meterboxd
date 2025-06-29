import React, { useRef, useState, useLayoutEffect } from "react";
import ReactSpeedometer from "react-d3-speedometer";

export default function Speedometer({
  min = 0,
  max = 100,
  value = 0,
  segments = 100,
  needleColor = "white",
  startColor = "#444",
  endColor = "#ff8001",
  textColor = "#fff",
}) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        // pick whatever aspect ratio you like; 0.6 is just an example
        setSize({ width: w, height: Math.round(w * 0.6) });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}
    >
      {size.width > 0 && (
        <ReactSpeedometer
          minValue={min}
          maxValue={max}
          value={value}
          needleColor={needleColor}
          startColor={startColor}
          segments={segments}
          maxSegmentLabels={5}
          endColor={endColor}
          textColor={textColor}
          currentValueText={`${value}`}
          width={size.width}
          height={size.height}
          ringWidth={30}
          needleTransition="easeQuad"
          needleTransitionDuration={2000}
        />
      )}
    </div>
  );
}
