export const logError = (context, error) => {
  console.error(`[${context}] Error:`, error.message);
  console.error(`[${context}] Stack:`, error.stack);
};
