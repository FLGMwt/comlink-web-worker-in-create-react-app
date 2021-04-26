const fibonacci = (i: number): number => {
  return i <= 1 ? i : fibonacci(i - 1) + fibonacci(i - 2);
};

export default fibonacci;
