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