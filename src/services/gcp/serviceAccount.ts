export const credentials = {
  SA_PROJECT_ID: process.env.SA_PROJECT_ID,
  SA_PRIVATE_KEY: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  SA_CLIENT_EMAIL: process.env.SA_CLIENT_EMAIL,
};
