import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from 'src/app/shared/layout/admin-layout/admin-layout.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { ApprovePaymentsComponent } from './approve-payments/approve-payments.component';
import { AdminOffersComponent } from './offers/offers.component';
import { AdminProductsComponent } from './products/products.component';
import { AdminBlogsComponent } from './blogs/list/list.component';
import { AdminBlogFormComponent } from './blogs/add-edit/add-edit.component';
import { AdminYoutubeVideosComponent } from './youtube-videos/list/list.component';
import { AdminYoutubeVideoFormComponent } from './youtube-videos/add-edit/add-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'manage-users',
        component: UsersComponent,
        title: 'Manage Users',
      },
      {
        path: 'manage-roles',
        component: RolesComponent,
        title: 'Manage Roles',
      },
      {
        path: 'approve-payments',
        component: ApprovePaymentsComponent,
        title: 'Approve Payments',
      },
      {
        path: 'offers',
        component: AdminOffersComponent,
        title: 'Offers',
      },
      {
        path: 'products',
        component: AdminProductsComponent,
        title: 'Product Moderation',
      },
      {
        path: 'blogs',
        component: AdminBlogsComponent,
        title: 'Manage Blogs',
      },
      {
        path: 'blogs/new',
        component: AdminBlogFormComponent,
        title: 'Add Blog Post',
      },
      {
        path: 'blogs/:id/edit',
        component: AdminBlogFormComponent,
        title: 'Edit Blog Post',
      },
      {
        path: 'youtube-videos',
        component: AdminYoutubeVideosComponent,
        title: 'Manage Videos',
      },
      {
        path: 'youtube-videos/new',
        component: AdminYoutubeVideoFormComponent,
        title: 'Add Video',
      },
      {
        path: 'youtube-videos/:id/edit',
        component: AdminYoutubeVideoFormComponent,
        title: 'Edit Video',
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
