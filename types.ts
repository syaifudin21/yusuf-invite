
export interface Wish {
  id: string;
  name: string;
  message: string;
  status: 'Going' | 'Maybe' | 'Not Going';
  timestamp: Date;
}

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
