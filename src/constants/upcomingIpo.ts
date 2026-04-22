export interface UpcomingIPO {
  id: string | number;
  companyName: string;
  symbol: string;
  type: 'IPO' | 'Right' | 'FPO' | 'Debenture' | 'Mutual Fund';
  sector: string;
  units: string;
  price: number;
  openingDate?: string;
  closingDate?: string;
  status: 'Upcoming' | 'Open' | 'Closed';
}

export const UPCOMING_IPOS: UpcomingIPO[] = [];
