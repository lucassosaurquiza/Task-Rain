type WeekBase = {
  id: string;
  startsAt: string;
  endsAt: string;
};

type OpenWeek = WeekBase & {
  status: "open";
  closedAt: null;
  totalCommitments: null;
  totalCompleted: null;
};

type ClosedWeek = WeekBase & {
  status: "closed";
  closedAt: string;
  totalCommitments: number;
  totalCompleted: number;
};

export type Week = OpenWeek | ClosedWeek;
