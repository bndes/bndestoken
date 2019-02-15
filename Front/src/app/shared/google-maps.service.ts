declare var google: any;

import { Injectable } from '@angular/core';

@Injectable()
export class GoogleMapsService {

    converteCidadeEmCoordenadas(cidade, result) {
        let self = this
        let geocoder = new google.maps.Geocoder()
    
        geocoder.geocode({ 'address': cidade }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
    
            let lat = results[0].geometry.location.lat()
            let lng = results[0].geometry.location.lng()
    
            return result([lat, lng])
    
          } else {
            alert("Não foi possivel obter localização: " + status);
          }
        })
      }
}

export interface Marcador {
    lat: number;
    lng: number;
    label?: string;
    draggable: boolean;
    info: string;
  }
  
export interface MarcadorLinha {
    latA: number;
    lngA: number;
  
    latB: number;
    lngB: number;
  }
  