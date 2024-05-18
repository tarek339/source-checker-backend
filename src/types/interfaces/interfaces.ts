interface ErrorMessage {
  message: string;
}

export interface Error {
  errors: Record<any, ErrorMessage>;
  message: string;
}

export const mongooseErrorHandler = (error: Error) => {
  var errorMessage = null;
  if (error.errors) errorMessage = Object.values(error.errors)[0].message;
  return errorMessage || error.message;
};
