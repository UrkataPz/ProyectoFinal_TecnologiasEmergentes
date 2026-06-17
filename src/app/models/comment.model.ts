export interface Comment {
  id?: string;
  postId: string;
  clubId: string;
  autorId: string;
  autorNombre: string;
  autorRolClub?: string | null;
  autorFotoUrl?: string | null;
  contenido: string;
  creadoEn?: any;
}
