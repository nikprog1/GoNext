/** Место — сущность из базы мест (не привязана к поездке) */
export interface Place {
  id: string;
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  /** GPS в формате Decimal Degrees: "latitude,longitude" */
  dd: string;
  photos: string[];
  createdAt: string;
}
