import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MapComponent } from './components/map/map.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  declarations: [MapComponent],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, MapComponent],
})
export class SharedModule {}
