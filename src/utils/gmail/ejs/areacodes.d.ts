declare module 'areacodes' {
  export default class areacodes {
    get(tel: string, callback: (err: any, data: AreaCodeData) => any): void;
  }

  export type AreaCodeData = {
    type: string;
    city: string;
    state: string;
    stateCode: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
}
