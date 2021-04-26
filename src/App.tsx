import { useState } from "react";
import "./App.css";
// Use webpack loader syntax to load the worker with `worker-loader`.
// With this strategy, no ejection or CRA webpack config modification is necessary.
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import FibonacciWorker from "worker-loader!./fibonacci.worker";
// Import the worker type directly.
import { FibonacciWorkerType } from "./fibonacci.worker";
import { wrap } from "comlink";

const blockingFibonacci = (i: number): number => {
  return i <= 1 ? i : blockingFibonacci(i - 1) + blockingFibonacci(i - 2);
};

function App() {
  // Provide a normal React counter to demonstrate that the main thread
  // is unaffected by the worker calculation but locked by the sync one.
  const [count, setCount] = useState(0);

  // Demonstrate thread locking with a long-running synchronous operation.
  const [blockingStatus, setBlockingStatus] = useState("idle");
  const startBlockingFibonacci = () => {
    setBlockingStatus("Pending...");
    // Using setImmediate so that the `Pending...` status gets a chance to be
    // reflected in the UI.
    setImmediate(() => {
      const result = blockingFibonacci(40);
      setBlockingStatus(`Complete. Result: ${result}`);
    });
  };

  const [workerStatus, setWorkerStatus] = useState("Idle");
  const startWorker = async () => {
    setWorkerStatus("Pending...");
    // Instantiate the worker.
    const worker = new FibonacciWorker();
    // Use Comlink's `wrap` function with the instance to get a function.
    const fibonacci = wrap<FibonacciWorkerType>(worker);
    // Invoke our function for a result like any Promise-returning function.
    const result = await fibonacci(40);
    setWorkerStatus(`Complete. Result: ${result}`);
  };
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={() => setCount((state) => state + 1)}>
          Increment on main thread.
        </button>
        <p>Count: {count}</p>
        <br />
        <button
          onClick={startBlockingFibonacci}
          disabled={blockingStatus === "Pending..."}
        >
          Start calculation on main thread
        </button>
        <p>Main thread calculation status: {blockingStatus}</p>
        <br />
        <button onClick={startWorker} disabled={workerStatus === "Pending..."}>
          Start calculation on worker
        </button>
        <p>Worker calculation status: {workerStatus}</p>
      </header>
    </div>
  );
}

export default App;
