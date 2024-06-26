import axios, { AxiosInstance, AxiosResponse } from "axios";
import { light } from "../types/lifx.js";
import { lightOwner } from "../types/internal";

export class LIFXAPIClient {

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

  public async validateToken(token: string): Promise<boolean> {
    try {
      const res = await this.client.get(`lights/all`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      })
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
  public async listLights(owner: lightOwner): Promise<light[]|`error`> {
    try {
    const res = await this.client.get(`lights/all`, {
        headers: {
            Authorization: `Bearer ${owner.token}`
        }
    })
    return  (res as AxiosResponse).data as light[]
    } catch (err) {
        console.error(err)
        return `error`
    }
    
  }
  public async toggleLight(owner: lightOwner, selector: string): Promise<`error`|`success`> {
    try {
      const res = await this.client.post(`lights/${selector}/toggle`,{}, {
        headers: {
            Authorization: `Bearer ${owner.token}`
        }
      })
      return "success"
    } catch (err) {
      console.error(err)
      return "error"
    }

  }
  public async dimLight(owner:lightOwner,selector:string,brightness:number) {
    try {
      const res = await this.client.post(`lights/${selector}/state`,{
        "power": "on",
        "brightness": brightness
      }, {
        headers: {
            Authorization: `Bearer ${owner.token}`
        }
      })
      return "success"
  } catch (err) {
    console.error(err)
    return "error"
  }
}
}