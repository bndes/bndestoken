import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class ConstantesService {

  public static serverUrl: string = environment.serverUrl; 


}
