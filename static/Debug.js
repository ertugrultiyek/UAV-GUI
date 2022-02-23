const DEBUG = arg => console.log(`${Error().lineNumber}:${arg}`);
const STACK = () => console.log(Error().stack);