export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface Solicitud {
  id?: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  clubId: string;
  clubNombre: string;
  estado: EstadoSolicitud;
  mensaje?: string;
  fechaSolicitud?: any;
}
