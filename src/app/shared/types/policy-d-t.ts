export interface IPolicySection {
  heading?: string;
  content?: string;
  items?: string[];
}

export interface IPolicyPage {
  title: string;
  intro?: string;
  sections: IPolicySection[];
}

export type IPolicyData = Record<string, IPolicyPage>;
