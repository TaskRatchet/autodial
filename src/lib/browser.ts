export const getParams = (): URLSearchParams => {
  return new URLSearchParams(window.location.search);
};
