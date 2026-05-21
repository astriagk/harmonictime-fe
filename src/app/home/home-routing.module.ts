import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeSevenComponent } from './home-seven/home-seven.component';

const routes: Routes = [
  {
    path: 'home-style-7',
    component: HomeSevenComponent,
    title: 'Home page seven',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
