import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './blog/blog.component';
import { BlogLeftSideComponent } from './blog-left-side/blog-left-side.component';
import { BlogNoSideComponent } from './blog-no-side/blog-no-side.component';
import { BlogTwoColComponent } from './blog-two-col/blog-two-col.component';
import { BlogThreeColComponent } from './blog-three-col/blog-three-col.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { BlogDynamicDetailsComponent } from './blog-dynamic-details/blog-dynamic-details.component';
import { ContactComponent } from './contact/contact.component';
import { PolicyComponent } from './policy/policy.component';
import { SellComponent } from './sell/sell.component';

const routes: Routes = [
  {
    path: 'blog',
    component: BlogComponent,
    title: 'Blog',
  },
  {
    path: 'blog-left-sidebar',
    component: BlogLeftSideComponent,
    title: 'Blog Left Sidebar',
  },
  {
    path: 'blog-no-sidebar',
    component: BlogNoSideComponent,
    title: 'Blog No Sidebar',
  },
  {
    path: 'blog-2-col',
    component: BlogTwoColComponent,
    title: 'Blog Two Col',
  },
  {
    path: 'blog-3-col',
    component: BlogThreeColComponent,
    title: 'Blog Three Col',
  },
  {
    path: 'blog-details',
    component: BlogDetailsComponent,
    title: 'Blog Details',
  },
  {
    path: 'blog-details/:id',
    component: BlogDynamicDetailsComponent,
    title: 'Blog Details',
  },
  {
    path: 'sell',
    component: SellComponent,
    title: 'Sell',
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contact',
  },
  {
    path: 'policy/:slug',
    component: PolicyComponent,
    title: 'Information',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
