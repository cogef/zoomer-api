/** Double encoding is required when UUID begins with '/' or contains '//'
 *
 * Ref: https://marketplace.zoom.us/docs/api-reference/zoom-api/meetings/pastmeetingdetails
 */
export const encodeUUID = (uuid: string) => {
  return encodeURIComponent(encodeURIComponent(uuid));
};

export const decodeUUID = (uuid: string) => {
  return decodeURIComponent(decodeURIComponent(uuid));
};
