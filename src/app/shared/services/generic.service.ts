import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GenericService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: '*/*',
    }),
  };

  constructor(private _httpClient: HttpClient) {}

  // get api data

  getObservable(_url: string | any): Observable<any> {
    const url = _url;
    return this._httpClient.get(url, this.httpOptions);
  }

  // Builds the auth header from the stored JWT. Used by every *Token method for
  // endpoints that identify the user from the Bearer token (e.g. wallet).
  private tokenOptions() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: '*/*',
        Authorization: `Bearer ${token ? JSON.parse(token) : ''}`,
      }),
    };
  }

  getObservableToken(_url: string | any): Observable<any> {
    return this._httpClient.get(_url, this.tokenOptions());
  }

  postObservableToken(_url: string, data: any): Observable<any> {
    return this._httpClient.post(_url, data, this.tokenOptions());
  }

  putObservableToken(_url: string, data: any): Observable<any> {
    return this._httpClient.put(_url, data, this.tokenOptions());
  }

  deleteObservableToken(_url: string): Observable<any> {
    return this._httpClient.delete(_url, this.tokenOptions());
  }

  getObservableJw(_url: string): Observable<any> {
    const url = _url;
    return this._httpClient.get(url);
  }

  // post api data

  postObservable(_url: string, data: any): Observable<any> {
    const url = _url;
    return this._httpClient.post(url, data, this.httpOptions);
  }

  postObservableImages(_url: string, data: any): Observable<any> {
    const url = _url;
    return this._httpClient.post(url, data, {
      headers: new HttpHeaders({
        Accept: '*/*',
      }),
    });
  }

  putObservable(_url: string, data: any): Observable<any> {
    const url = _url;
    return this._httpClient.put(url, data, this.httpOptions);
  }

  deleteObservable(_url: string): Observable<any> {
    const url = _url;
    return this._httpClient.delete(url);
  }

  deletePayloadObservable(_url: string, data: any): Observable<any> {
    const url = _url;
    return this._httpClient.delete(url, { body: data });
  }

  getData() {
    return of([1, 2, 3]);
  }
}
