export type OrderStatus = "active" | "past";

export interface JobTravelerSection {
  id: string;
  labelEn: string;
  labelEs: string;
  contentEn: string;
  contentEs: string;
}

export interface JobTraveler {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customer: string;
  jobName: string;
  description: string;
  poNumber: string;
  salesPerson: string;
  engineer: string;
  entryPerson: string;
  requiredDate: string;
  quantityForOrder: number;
  quantityForStock: number;
  totalQuantity: number;
  shipVia: string;
  shipDate: string;
  shipTo: string;
  sourceFileName: string;
  sections: JobTravelerSection[];
}
