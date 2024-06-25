import axios, { AxiosInstance, AxiosResponse } from "axios";
import { light } from "../types/lifx";
import { lightOwner } from "../types/internal";

export class APIClient {

    private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.lifx.com/v1/',
      timeout: 3000,
      headers: {
        //'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  public async listLights(owner: lightOwner): Promise<light[]|`error`> {
    this.client.get(`lights/all`, {
        headers: {
            Authorization: `Bearer ${owner.token}`
        }
    })
    .catch((err) => {
        console.error(err)
        return `error`
    })
    .then((res) => {
        return  (res as AxiosResponse).data as light[]
    })

    return Promise.resolve(`error`)

  }
}