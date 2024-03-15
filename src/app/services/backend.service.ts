import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

//const APIUrl = 'http://173.212.243.247:82/api/';
 const APIUrl = 'https://localhost:7288/api/';
//https://localhost:7288/swagger/index.html

@Injectable({
  providedIn: 'root'
})  

export class BackendService {

  constructor(private http: HttpClient) { }

  // GetRequest(api: string) {
  //   return firstValueFrom(this.http.get<Response>(APIUrl + api));
  // }

  PostRequest(api: string, data: any) {
    return firstValueFrom(this.http.post<Response>(APIUrl + api, data));
  }

}

export interface Response {
  isSuccessful: boolean,
  data: any,
  message: string
} 