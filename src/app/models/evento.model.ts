export interface Evento {
  id?: string;
  clubId: string;
  clubNombre: string;
  titulo: string;
  descripcion: string;
  fecha: string;       // ISO string "YYYY-MM-DD"
  hora: string;        // "HH:MM"
  lugar: string;
  activo: boolean;
  creadoEn?: any;
}
