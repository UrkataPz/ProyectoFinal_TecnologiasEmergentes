import { Component } from '@angular/core';

@Component({
  selector: 'app-panel-usuario',
  standalone: true,
  templateUrl: './panel-usuario.component.html',
  styleUrl: './panel-usuario.component.css'
})
export class PanelUsuarioComponent {
  solicitudes = [
    { club: 'Club de Tecnología e Innovación', estado: 'Pendiente', fecha: '05/05/2026' },
    { club: 'Club de Voluntariado', estado: 'Aprobada', fecha: '04/05/2026' },
    { club: 'Club de Arte y Cultura', estado: 'En revisión', fecha: '03/05/2026' }
  ];

  anuncios = [
    'Reunión general de clubes el próximo jueves a las 6:00 p.m.',
    'Actualizar datos de miembros antes del cierre del periodo.',
    'Nuevo calendario de actividades estudiantiles disponible.'
  ];
}
