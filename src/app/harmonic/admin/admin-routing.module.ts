import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from 'src/app/shared/layout/admin-layout/admin-layout.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'manage-users',
        component: UsersComponent,
        title: 'Manage Users Page',
      },
      {
        path: 'manage-roles',
        component: RolesComponent,
        title: 'Manage Roles Page',
      },
    ],
  },
  { path: '**', redirectTo: 'manage-users' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
