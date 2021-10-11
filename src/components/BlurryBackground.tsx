import { useMemo } from "react"
import useMeasure from "react-use-measure"

export const BlurryBG = () => {
  const [ref, { width, height }] = useMeasure()
  const randomGeneratedCircles = useMemo(() => {
    const circles = []
    const width = 900
    const height = 600
    for (let i = 0; i < 8; i++) {
      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 357,
        color: Math.random() > 0.5 ? 1 : 0,
      })
    }
    return circles
  }, [])
  return (
    <div className="relative w-full h-full" ref={ref}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        version="1.1"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 900 600"
      >
        <defs>
          <filter id="blur1" width="120%" height="120%" x="-10%" y="-10%">
            <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            ></feBlend>
            <feGaussianBlur
              result="effect1_foregroundBlur"
              stdDeviation="161"
            ></feGaussianBlur>
          </filter>
        </defs>
        <path fill="#513fff" d="M0 0H900V600H0z"></path>
        <g filter="url(#blur1)">
          {randomGeneratedCircles.map((circle, idx) => (
            <circle
              key={idx.toString()}
              cx={circle.x}
              cy={circle.y}
              r={circle.r}
              fill={circle.color === 1 ? "#4bb34e" : "#513fff"}
            />
          ))}
          {/* <circle cx="774" cy="560" r="357" fill="#4bb34e"></circle>
        <circle cx="726" cy="12" r="357" fill="#513fff"></circle>
        <circle cx="2" cy="169" r="357" fill="#4bb34e"></circle>
        <circle cx="364" cy="324" r="357" fill="#4bb34e"></circle>
        <circle cx="196" cy="516" r="357" fill="#513fff"></circle>
        <circle cx="340" cy="38" r="357" fill="#4bb34e"></circle> */}
        </g>
      </svg>
    </div>
  )
}
