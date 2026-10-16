export interface TrustStat {
  value: number;
  suffix: string;
  label: string;
}

export const TRUST_STATS: TrustStat[] = [
  { value: 20, suffix: "+", label: "Years Constructing Legacy" },
  { value: 280, suffix: "+", label: "Homes Built" },
  { value: 12, suffix: "+", label: "Developed Projects" },
  { value: 10, suffix: "+", label: "Completed Villa Projects" },
];
