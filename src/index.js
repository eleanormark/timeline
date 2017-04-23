export const greeting = (message = 'Hi there!') => {
  const greeting = `Hello ${message}!`;
  console.log(greeting);
  return greeting;
};
