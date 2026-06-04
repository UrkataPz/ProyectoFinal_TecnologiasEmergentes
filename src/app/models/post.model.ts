export interface Post {
  id?: string;
  clubId: string;
  autorId: string;
  autorNombre: string;
  categoria: 'Anuncios' | 'Eventos' | 'Proyectos' | 'Social';
  contenido: string;
  creadoEn?: any;
  likes: string[];
}
