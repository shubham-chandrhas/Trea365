import {User} from './user';
import {Action} from './action';

export interface Message {
    from?: User;
    to?: any;
    content?: any;
    action?: Action;
}
