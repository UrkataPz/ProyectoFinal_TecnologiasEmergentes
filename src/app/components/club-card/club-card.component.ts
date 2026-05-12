import { Component, input, output } from '@angular/core';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-club-card',
  standalone: true,
  templateUrl: './club-card.component.html',
  styleUrl: './club-card.component.css'
})
export class ClubCardComponent {
  club = input.required<Club>();
  mostrarAcciones = input<boolean>(true);

  verDetalle = output<string>();
  solicitarIngreso = output<Club>();
}
