export interface Post {
  id?: string;
  clubId: string;
  autorId: string;
  autorNombre: string;
  autorRolClub?: string | null;
  autorFotoUrl?: string | null;
  categoria: 'Anuncios' | 'Eventos' | 'Proyectos' | 'Social';
  contenido: string;
  imagenUrl?: string | null;
  creadoEn?: any;
  likes: string[];
}
