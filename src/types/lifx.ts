export interface light {
    id: string
    uuid: string
    label: string
    connected: boolean
    power: string
    color: ColorL
    brightness: number
    effect: string
    group: Group
    location: Location
    product: Product
    last_seen: string
    seconds_since_seen: number
  }
  
  export interface ColorL {
    hue: number
    saturation: number
    kelvin: number
  }
  
  export interface Group {
    id: string
    name: string
  }
  
  export interface Location {
    id: string
    name: string
  }
  
  export interface Product {
    name: string
    identifier: string
    company: string
    vendor_id: number
    product_id: number
    capabilities: Capabilities
  }
  
  export interface Capabilities {
    has_color: boolean
    has_variable_color_temp: boolean
    has_ir: boolean
    has_hev: boolean
    has_chain: boolean
    has_matrix: boolean
    has_multizone: boolean
    min_kelvin: number
    max_kelvin: number
  }
export type basicColors = 'white' |'red'| 'orange' | 'yellow' | 'cyan' | 'green' | 'blue' | 'purple' | 'pink'
export interface scene {
  uuid: string;
  name: string;
  account: Account;
  states: State[];
  created_at: string;
  updated_at: string;
}

export interface Account {
  uuid: string;
}

export interface State {
  brightness: number;
  selector: string; 
}

export interface lightState {
  power?: 'on' | 'off' ;
  color?: string;
  brightness?: number;
  duration?: number;
  infrared?: number;
}

export interface pulseEffectOptions {
  color?: string;
  from_color?: string;
  period?: number;
  cycles?: number;
  persist?: boolean;
  power_on?: boolean;
}

export interface flameEffectOptions {
  period?: number;
  duration?: number;
  power_on?: boolean;
}

export type Direction = 'forward' | 'backward'

export interface moveEffectOptions {
  direction?: Direction;
  period?: number;
  cycles?: number;
  power_on?: boolean;
}

export interface breatheEffectOptions {
  color?: string;
  from_color?: string;
  period?: number;
  cycles?: number;
  persist?: boolean;
  power_on?: boolean;
  peak?: number;
}