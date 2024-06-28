import axios, { AxiosInstance, AxiosResponse } from "axios";
import { light, lightState, scene } from "../types/lifx.js";
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
  public async listScenes(owner: lightOwner): Promise<scene[]|`error`> {
    try {
    const res = await this.client.get(`scenes`, {
        headers: {
            Authorization: `Bearer ${owner.token}`
        }
    })
    return  (res as AxiosResponse).data as scene[]
    }
    catch (err) {
        console.error(err)
        return `error`
    }
  }

  public async setLightState(owner: lightOwner, selector: string, state: lightState): Promise<`error`|`success`> {
    try {
      const res = await this.client.put(`lights/${selector}/state`, state, {
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
      const res = await this.client.put(`lights/${selector}/state`,{
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
  public async colorLight(owner:lightOwner,selector:string,color:string) {
    try {
      const res = await this.client.put(`lights/${selector}/state`,{
        "power": "on",
        "color": color
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

  public async activateScene(owner:lightOwner,sceneID:string) { 
    try {
      const res = await this.client.put(`scenes/scene_id:${sceneID}/activate`,{}, {
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