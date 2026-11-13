export interface TrustStat {
  value: number;
  suffix: string;
  label: string;
}

export const TRUST_STATS: TrustStat[] = [
  { value: 20, suffix: "+", label: "Years Constructing Legacy" },
  { value: 100, suffix: "+", label: "Homes Built" },
  { value: 6, suffix: "+", label: "Developed Projects" },
  { value: 2, suffix: "+", label: "Completed Villa Projects" },
];
