import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeSevenComponent } from './home-seven/home-seven.component';

const routes: Routes = [
  {
    path: '',
    component: HomeSevenComponent,
    title: 'Home',
  },
  // The home page used to live at /home/home-style-7 — keep old links and
  // bookmarks resolving instead of dropping them on the 404 page.
  {
    path: 'home-style-7',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
