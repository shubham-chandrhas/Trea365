/* *
 *     	Company Super Admin Landing Component
 *  	cognitoService used to logout the current logged in user
 * */
//import 'rxjs/add/operator/filter';
//import 'rxjs/add/operator/pairwise';

import { Component, Inject, OnInit, AfterViewInit, HostListener, ViewChild, Renderer, ElementRef, AfterViewChecked  } from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder} from '@angular/forms';
import { DOCUMENT } from '@angular/platform-browser';
import { Router, ActivatedRoute, RoutesRecognized } from '@angular/router';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import { Location } from '@angular/common';

import { AwsCognitoService } from '../../../auth/aws-cognito.service';
import { UtilService } from '../../../shared/service/util.service';
import { SocketService } from '../../../shared/service/socket.service';
import { HttpService } from '../../../shared/service/http.service';
import { ConstantsService } from '../../../shared/service/constants.service';

import { Action } from '../../../shared/model/chat/action';
import { Event } from '../../../shared/model/chat/event';
import { Message } from '../../../shared/model/chat/message';
import { User } from '../../../shared/model/chat/user';
import { empty } from '../../../../../node_modules/rxjs/Observer';
import { Key } from '../../../../../node_modules/protractor';
import { ItemClassesComponent } from '../../admin/item-classes/item-classes.component';

declare var $ :any;

export class Name {
	constructor(public name: string) { }
  }


@Component({
    selector: '',
    templateUrl: './landing.html',
})

export class CSALandingComponent implements OnInit, AfterViewInit, AfterViewChecked {
    public companyInfo: any;
    public arrowIcon: boolean = false;
    public selL1Menu: string;
    public selL2Menu: string;
    public menuList: any[];
    public receciveMsg: any = '';
    public nameCtrl: FormControl;
    public filteredNames: Observable < any[] > ;
    //userRole: string;

    ioConnection: any;
    messages: Message[] = [];
    messageList: any[] = [];
    user: User;
    messageContent: string;
    chatFm: FormGroup;
    loggedInUser;
    chatBox: any[] = [];
    isOpen = false;
    isChatOpen = false;
    unreadMsgs: number = 0;
    compUsersList: any[] = [];
	searchStatus: boolean = false;
	chatBoxUserId: any = '';
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    //chatMsg: FormControl;

    names: Name[] = [{
            name: 'Yogesh Mane'
        },
        {
            name: 'Agnes'
        },
        {
            name: 'Billy'
        },
        {
            name: 'Calvin'
        },
        {
            name: 'Christina'
        }
    ];

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private cognitoService: AwsCognitoService,
        public util: UtilService,
        private renderer: Renderer,
        private router: Router,
        private fb: FormBuilder,
        private http: HttpService,
        private socketService: SocketService,
        private constant: ConstantsService,
        private location: Location
    ) {
        // if(sessionStorage.getItem('refreshStatus') && sessionStorage.getItem('refreshStatus') == '1'){
        // 	sessionStorage.removeItem('refreshStatus');
        // 	location.reload();
        // }
        console.log("this.router");
        console.log(this.router.events);
        // 		this.router.events.filter(e => e instanceof RoutesRecognized).pairwise().subscribe((event: any[]) => {
        //     		console.log("event[0].urlAfterRedirects");
        //     		console.log(event[0].urlAfterRedirects);
        //     		if(event[0].urlAfterRedirects == '/login'){
        //     			setTimeout(() => {
        //     				location.reload();
        // 		}, 0)
        //     		}
        // });

        this.nameCtrl = new FormControl();
        this.filteredNames = this.nameCtrl.valueChanges
            .pipe(
                startWith(''),
                map(data => data ? this.filterNames(data) : this.compUsersList.slice())
            );
        this.menuList = this.util.getMenulist();
        this.loggedInUser = JSON.parse(atob(localStorage.getItem('USER')));
        console.log(this.loggedInUser);
    }

    ngOnInit() {

        let self = this;
        window.scrollTo(0, 0);
        this.util.setLoggedInUserName( this.loggedInUser.last_name ? this.loggedInUser.first_name+" "+this.loggedInUser.last_name : this.loggedInUser.first_name );
        this.util.setRoleName(JSON.parse(atob(localStorage.getItem('USER'))).role_id == '2' ? JSON.parse(atob(localStorage.getItem('USER'))).role.role_name : JSON.parse(atob(localStorage.getItem('USER'))).permission_role.role_name);
        // console.log("this.util.setLoggedInUserName()", this.util.getLoggedInUserName());
        // console.log(JSON.parse(atob(localStorage.getItem('USER'))).role.role_name);
        this.renderer.setElementClass(document.body, 'bg-img', false);
        this.getCompanyInfo();
        this.getUsersList();
        this.util.newMenuSelection.subscribe(menu => setTimeout(() => {
            if (menu) {
                this.selL1Menu = menu.menu;
                this.selL2Menu = menu.subMenu;
            }
        }, 0));
        // this.util.addSubscriptionAlert('Warning','This is just a warning message!!');

        $('.live-chat-class').css('display', 'none');
        this.toggleArrow();
        (function() {
            console.log('FN....');
            $('#live-chat header').on('click', function() {
                self.unreadMsgs = 0;
                self.isChatOpen = self.isChatOpen ? false : true;
                $('.chat').slideToggle(300, 'swing');
                //$('.chat-message-counter').fadeToggle(300, 'swing');
            });
            $('.chat-close').on('click', function(e) {
                e.preventDefault();
                //alert(33);
                $('.live-chat-class').fadeOut(300);
                self.searchStatus = false;
                self.chatBox = [];
                self.nameCtrl.setValue('');

            });
        })();

        this.initIoConnection();
        this.chatFm = this.fb.group({
			chatMsg: new FormControl(),
			chatBoxId : new FormControl()
        });

        const AVATAR_URL = 'https://api.adorable.io/avatars/285';

        this.user = {
            id: this.loggedInUser.id,
            avatar: `${AVATAR_URL}/12111.png`,
            name: this.loggedInUser.first_name + " " + this.loggedInUser.last_name
        };
        this.scrollToBottom();

        //this.util.addSubscriptionAlert('Warning', "Your account has been suspended. Please contact your company administrator or Call XXXX-XXX-XXX to speak with a TREA 365 Representative");
        if(JSON.parse(atob(localStorage.getItem('USER'))).company_status[0].is_active == 2){
            sessionStorage.getItem('WORNING_FLAGE') && sessionStorage.getItem('WORNING_FLAGE') == '1' ? self.util.showAlertToast('Warning', this.constant.WORNING_AC_MSG) : '' ;
        }
        this.util.updatePagination();
    }

    ngAfterViewInit() {

        $("#leftside-navigation > ul > li > a").click(function(event) {
            $("#leftside-navigation ul ul").slideUp(function(event) {
                    $("#leftside-navigation ul li").removeClass('menu-open');

                    $(".content-wrapper").css('min-height', window.innerHeight - $(".main-header").height() - $(".main-footer").height() - 20);
                }), $(this).next().is(":visible") || $(this).next().slideDown(function(event) {
                    var self = $(this).closest('li');
                    $(self[0]).addClass('menu-open');

                    var sidebarHeight = $('#leftside-navigation').height() || 0;
                    if (sidebarHeight > window.innerHeight) {
                        $(".content-wrapper").css('min-height', sidebarHeight);
                    } else {
                        $(".content-wrapper").css('min-height', window.innerHeight - $(".main-header").height() - $(".main-footer").height() - 20);
                    }
                }),
                event.stopPropagation()
        });

    }
    filterNames(name: string) {
        return this.compUsersList.filter(data =>
            data.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }

    openChatBox() {
        $('.live-chat-class').css('display', 'block');
        this.isOpen = true;
        this.isChatOpen = true;
        this.unreadMsgs = 0;
    }
    // getMarginTop(index){
    // 	console.log(index)
    // 	return index.style.marginRight + 350
    // }
    goToOnboarding() {
        sessionStorage.setItem('refreshStatus', '1');
        this.router.navigate(['/csa-onboarding']);
    }


    toggleArrow(): void {
        this.arrowIcon = !this.arrowIcon;
        this.renderer.setElementClass(document.body, 'sidebar-collapse', !this.arrowIcon);
    }

    getCompanyInfo(): void {
        var self = this;
        this.cognitoService.getCompanyInfo(function(err, res) {
            if (!err) {
                self.companyInfo = res.data[0];
                self.util.setCompanyId(res.data[0].company_id);
                self.util.setCompanyName(res.data[0].organization);
                self.util.setCurrency(res.data[0].currency);
                self.util.setCurrencySign(res.data[0].country_name.currency_sign);
                self.util.setCountryCode(JSON.parse(atob(localStorage.getItem('USER'))).country_code);
                self.util.setRole(JSON.parse(atob(localStorage.getItem('USER'))).role_id);
                self.util.setCompanyLogo(res.data[0].logo);
                
                //self.userRole = JSON.parse(atob(localStorage.getItem('USER'))).role.role_name;
                //self.user.id = JSON.parse(atob(localStorage.getItem('USER'))).id;
                console.log(JSON.parse(atob(localStorage.getItem('USER'))));

                //self.util.generatePermissionData();
            }
        });
    }

    getUsersList(): void {
        let self = this;
        // this.http.doGet('getEmployee', function(error: boolean, response: any) {
        //     if (error) {} else {
        //         console.log("User List");
        //         console.log(response.data);
        //         self.compUsersList = response.data.filter(item => item.name = item.employee_info.first_name + " " + item.employee_info.last_name);
        //     }
        // });

        this.http.doGet('getMessageUsers/'+JSON.parse(atob(localStorage.getItem('USER'))).company_id, function(error: boolean, response: any) {
            if (error) {} else {
                console.log("User List");
                console.log(response.data);
                self.compUsersList = response.data.filter(item => item.name = item.first_name + " " + item.last_name);
                self.compUsersList.map(user => {
                    if(user.last_message && user.last_message.is_seen == 0 && user.user_id == self.loggedInUser.id){
                        self.util.getUnreadConversation().includes(user.user_id) ? '' : self.util.addUnreadConversation(user.user_id);
                    }
                });
            }
        });

    }

    getSelectedUser(user): void {
        let self = this;
        //self.chatBox.push(user);
        self.searchStatus = true;
        //console.log(user);
        self.util.addSpinner("chatHistory", "loading...");
        this.http.doGet('getUserWiseMessage/' + user.user_id + '/' + user.company_id, function(error: boolean, response: any) {
            self.util.removeSpinner("chatHistory", " ");
            if (error) {
                console.log(error);
            } else {
                console.log(response.data);
                let recieverMsgs = [];

                response.data.forEach(element => {
                    let from = element.sender_id == self.loggedInUser.id ? 'self' : 'other';
                    recieverMsgs.push({
                        'date': new Date(element.created_at),
						'senderName': element.sender.first_name,
						'senderId' : element.sender.id,
                        'messageTxt': element.message,
                        'from': from
                    });
                });
                self.chatBox.push({
					'receiverId': user.user_id,
					'receiverName':user.name,
                    'recieverMsgs': recieverMsgs
				});
				console.log(user.user_id);




            }
        });
    }
    resetChat() {
        this.messageList = [];
        this.chatBox = [];
        this.searchStatus = false;
        this.receciveMsg = '';
        $('.live-chat-class').fadeOut(300);
        this.nameCtrl.setValue('');
    }
    logout(): void {
        this.cognitoService.logout();
    }




    // Socket Code
    private initIoConnection(): void {
        this.socketService.initSocket();
        this.ioConnection = this.socketService.onMessage()
            .subscribe((message: any) => {
                console.log("New Message ::"+message);
                //alert(this.location.path());
                //this.location.path() != '/message/csa/messaging' &&
                if(this.util.getActiveChatUserId() != message.message.sender_id){
                    this.updateCount(message.message);
                }

    //             this.util.playMsgAlert();
    //             this.messages.push(message);
				// console.log("Socket Message ::::", message, this.chatBox);
				// var self = this;
				// self.util.addSpinner("chatHistory", "loading...");
				// this.http.doGet('getUserWiseMessage/' + message.message.sender.id + '/' + message.message.sender.company_id, function(error: boolean, response: any) {
				// 	self.util.removeSpinner("chatHistory", " ");
				// 	if (error) {
				// 		console.log(error);
				// 	} else {
				// 		let messageList = response.data;
				// 		self.addMessage(messageList);
				// 	}
				// });

    //             if (!self.isChatOpen) {
    //                 self.unreadMsgs++;
    //             }
    //             if (!self.isOpen) {
    //                 $('.live-chat-class').css('display', 'block');
    //                 $('.chat').css('display', 'none');
    //                 self.isOpen = true;
    //             }
            });
        this.socketService.onEvent(Event.CONNECT)
            .subscribe(() => {
                console.log('connected');
            });

        this.socketService.onEvent(Event.DISCONNECT)
            .subscribe(() => {
                console.log('disconnected');
            });
    }

    updateCount(msg){
        if(this.util.getUnreadConversation().includes(msg.sender_id)){
            return;
        }else{
            this.util.addUnreadConversation(msg.sender_id);
        }
    }

    addMessage(message) {
	//	console.log(this.chatBox.length,message)
        if (this.chatBox.length > 0) {
            let isAdded = false;
            this.chatBox.forEach((element, key) => {
               // console.log(element,message[0].sender_id);
                // element.recieverMsgs=[];
                if (element.receiverId == message[0].sender_id || message[0].sender_id == this.loggedInUser.id) {
                    element.recieverMsgs=[];
					message.forEach(messageList => {
                      //  console.log(messageList)
                        let from = messageList.sender_id  == this.loggedInUser.id ? 'self' : 'other';
						element.recieverMsgs.push({
							'date': new Date(),
							'senderName': messageList.senderName,
							'senderId' : messageList.sender ? messageList.sender.id:messageList.senderId,
							'messageTxt': messageList.message,
							'from': from
						});
						isAdded = true;
					});
				}
            });
            if (!isAdded) {
                this.chatBox.push(this.createChatBox(message));
            }
        } else {
               this.chatBox.push(this.createChatBox(message));
        }
    }
    //openChatBox
    createChatBox(message) {
		console.log(message)
		let receiveMsg =[];
		message.forEach(element => {
            let from = element.sender_id == this.loggedInUser.id ? 'self' : 'other';
			receiveMsg.push({	'date': new Date(),
				'messageTxt': element.message,
				'senderId':element.sender.id,
				'senderName': element.sender.first_name,
				'from': from
			});
		});
        return {
            'receiverId': message[0].sender_id,
			'receiverName':message[0].sender.first_name,
            'recieverMsgs': receiveMsg
        };
    }

    public sendMessage(message: string, receiverId: any): void {
        if (!message) {
            return;
		}
		console.log(receiverId);
        this.socketService.send({
            from: this.user,
            to: receiverId,
            content: message
        });
        this.messageContent = null;
    }

    public sendNotification(params: any, action: Action): void {
        let message: Message;

        if (action === Action.JOINED) {
            message = {
                from: this.user,
                action: action
            }
        } else if (action === Action.RENAME) {
            message = {
                action: action,
                content: {
                    username: this.user.name,
                    previousUsername: params.previousUsername
                }
            };
        }

        this.socketService.send(message);
    }


    get chatMsg() {
        return this.chatFm.get('chatMsg');
	}
	get chatBoxId() {
		return this.chatFm.get('chatBoxId');
	}
    onSubmit(form: FormGroup,id) {
        //alert("Msg :: "+this.chatFm.get('chatMsg').value);
        console.log(this.chatFm.get('chatBoxId').value,id)
        this.sendMessage(this.chatFm.get('chatMsg').value,id);
        if (!this.chatFm.get('chatMsg').value)
			return;

			let obj = this.chatBox.find(item => item.receiverId == id);
			let index = this.chatBox.indexOf(obj);
			//this.chatBox.fill(obj.name='some new string', index, index++);
		console.log(obj,index);
        this.chatBox[index].recieverMsgs.push({
            'date': new Date(),
			'messageTxt': this.chatFm.get('chatMsg').value,
            'from': 'self'
        });
        this.chatFm.get('chatMsg').setValue('');
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) {}
    }
}
