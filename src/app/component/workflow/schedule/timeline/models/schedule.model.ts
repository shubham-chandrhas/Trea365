import { Resource } from './resource.model';

export class Schedule {
  start: Date;
  end: Date;
  resources: Resource[];
}