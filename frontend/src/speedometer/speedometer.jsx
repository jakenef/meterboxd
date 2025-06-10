import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

export default function Speedometer({
  min = 0,
  max = 100,
  value = 0,
  segments = 100,
  needleColor = 'white',
  startColor = '#444',
  endColor = '#ff8001',
  textColor = '#fff',
}) {
  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto'}}>
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
        height={250}
        width={400}
        ringWidth={30}
        needleTransition="easeQuad"
        needleTransitionDuration={2000}
      />
    </div>
  );
}
