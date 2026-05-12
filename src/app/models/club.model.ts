export interface Club {
  id?: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  objetivo: string;
  requisitos: string;
  miembros: number;
  activo: boolean;
  creadoEn?: any;
}
