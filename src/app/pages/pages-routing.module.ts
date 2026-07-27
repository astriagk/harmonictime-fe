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
    data: {
      seo: {
        title: 'Sell Your Watch',
        description:
          'Sell your pre-owned or vintage watch on Krono2. List with a verified seller account, reach genuine collectors and get paid securely.',
      },
    },
  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      seo: {
        title: 'Contact Us',
        description:
          'Get in touch with the Krono2 team about an order, a listing or selling your watch. Bangalore-based support for buyers and sellers across India.',
      },
    },
  },
  {
    path: 'policy/:slug',
    component: PolicyComponent,
    data: {
      seo: {
        title: 'Policies & Information',
        description:
          'Krono2 policies and information — shipping, returns, privacy and terms for buying and selling watches on the marketplace.',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
