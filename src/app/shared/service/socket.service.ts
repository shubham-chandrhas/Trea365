import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Message } from '../model/chat/message';
import { Event } from '../model/chat/event';
import { HttpService } from './http.service';
import { APP_CONFIG, AppConfig } from '../../app-config.module';
import * as socketIo from 'socket.io-client';

//const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class SocketService {
    private socket;

    constructor(
        @Inject(APP_CONFIG) 
        private config: AppConfig,
        public http:HttpService,
    ) { }

    public initSocket(): void {
        this.socket = socketIo(this.config.socketServerURL);
    }

    public send(message: Message): void {
        this.socket.emit('message', message);
        console.log(message);
        let userData = JSON.parse(atob(localStorage.getItem('USER')));
        let reqObj = {"company_id":userData.company_id,
                      "receiver_id":message.to,
                      "message":message.content}
        this.http.doPost('saveMessages',reqObj,function(error: boolean, response: any){
            console.log(response);
        });
    }

    public onMessage(): Observable<Message> {
       // console.log(JSON.parse(atob(localStorage.getItem('USER'))));
            let userData = JSON.parse(atob(localStorage.getItem('USER')));
            let socketUrl = "message-"+userData.id+":App\\Events\\Messages";
            console.log(socketUrl)
        return new Observable<Message>(observer => {
            //this.socket.on('message', (data: Message) => observer.next(data));
            this.socket.on(socketUrl, (data: Message) => observer.next(data));
        });
    }

    public onEvent(event: Event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, () => observer.next());
        });
    }
}
