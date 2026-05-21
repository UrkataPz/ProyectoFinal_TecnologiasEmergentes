import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-club-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './club-card.component.html',
  styleUrl: './club-card.component.css'
})
export class ClubCardComponent {
  club = input.required<Club>();
  mostrarAcciones = input<boolean>(true);
  estadoSolicitud = input<string | null>(null);

  verDetalle = output<string>();
  solicitarIngreso = output<Club>();
}
