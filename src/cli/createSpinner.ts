/**
 * Creates a loading spinner animation in the console.
 */
const createSpinner = (message: string): { start: () => void; stop: () => void } => {
    const frames = ["", ".", "..", "..."];
    let frameIndex = 0;
    let interval: NodeJS.Timeout;
  
    return {
      start: () => {
        process.stdout.write(`${message} `); // Initial message
        interval = setInterval(() => {
          process.stdout.clearLine(0); // Clear the current line
          process.stdout.cursorTo(0); // Move cursor to the beginning of the line
          process.stdout.write(`${message}${frames[frameIndex]}`); // Write the animated message
          frameIndex = (frameIndex + 1) % frames.length;
        }, 500); // Update every 500ms
      },
      stop: () => {
        clearInterval(interval);
        process.stdout.clearLine(0); // Clear the current line
        process.stdout.cursorTo(0); // Move cursor to the beginning of the line
        process.stdout.write("\n"); // Add a newline to separate the spinner from subsequent logs
      },
    };
  };
  
  

export default createSpinner;
