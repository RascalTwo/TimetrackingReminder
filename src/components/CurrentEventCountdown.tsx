export default function CurrentEventCountdown({ start, end, secondsRemaining }: { start: Date, end: Date, secondsRemaining: number }) {
  return <div>
    <h2>Current Time Block</h2>
    {start.toLocaleTimeString()} -&gt; {end.toLocaleTimeString()}
    <br />
    <div>{Math.floor(secondsRemaining / 60)}m{Math.floor(secondsRemaining % 60)}s</div>
  </div>;
}