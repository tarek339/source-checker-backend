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

export interface IPages {
  _id: string;
  title: string;
  url: string;
  note: string;
  isMobileView: boolean | null;
}

export interface ISurvey {
  _id: string;
  validUntil: string;
  anonymousResults: string;
  freeUserNames: string;
  selectedSurveysOption: string;
  selectedResultsOption: string;
  surveyId: string;
  surveyNumber: string;
  surveyPin: string;
  link: string;
  pages: IPages[];
}
