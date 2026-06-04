export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';
export type RolClub = 'Presidente' | 'Vicepresidente' | 'Secretario' | 'Tesorero';

export interface Solicitud {
  id?: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  clubId: string;
  clubNombre: string;
  estado: EstadoSolicitud;
  rolClub?: RolClub | null;
  esModeradorClub?: boolean;
  mensaje?: string;
  fechaSolicitud?: any;
}
