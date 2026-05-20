export type TipoNotificacion = 'solicitud_aprobada' | 'solicitud_rechazada' | 'evento_nuevo';

export interface Notificacion {
  id?: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  leida: boolean;
  creadaEn?: any;
  referenciaId?: string; // solicitudId o eventoId
}
