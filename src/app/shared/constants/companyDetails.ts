import { environment } from 'src/environments/environment';

export const companyDetails = {
  name: 'Krono²',
  // Krono² is a trade name, not a legal entity: Astria GK runs several
  // businesses and is the party that bills, holds the GSTIN and is the merchant
  // of record. Invoices must show both — the brand buyers recognise and the
  // entity that legally issues the document.
  legalName: 'Astria GK',
  email: environment.supportEmail,
  address: 'NO. 12, 1st Floor, Pipeline, Srinagar, Bangalore - 560026',
  phone: '(+91) 88673 47448',
  gstNumber: '29CKDPG8193B2Z2',
  description:
    'Discover a curated collection of pre-owned and vintage watches, perfect for collectors and enthusiasts. We specialize in sourcing high-quality, authentic timepieces, ensuring trust and excellence in every purchase. Explore timeless craftsmanship with confidence.',
};

// The businesses Astria GK trades under. They share one legal entity, one GSTIN
// and one address — only the brand name, support email and logo differ. Used by
// the internal invoice tool to bill under whichever business made the sale.
export const businessBrands = [
  {
    name: companyDetails.name,
    email: companyDetails.email,
    logo: 'assets/logo/logo-no-name.png',
    // Leads the invoice number (KR-2607-0001) so each business keeps its own
    // series and an invoice can be traced to a brand at a glance.
    invoicePrefix: 'KR',
  },
  {
    name: 'Mangala Textiles',
    email: 'mangalatextiles@astriagk.com',
    // No logo mark exists for this brand — its invoices print the name instead.
    logo: '',
    invoicePrefix: 'MT',
  },
];

// Logo files that can be stamped on an invoice. Kept separate from the brands
// above so a brand can be billed under a different mark when needed (and so
// "no logo" — fall back to the brand name in text — stays selectable).
export const invoiceLogoOptions = [
  { label: 'Krono² (mark only)', path: 'assets/logo/logo-no-name.png' },
  { label: 'Krono² (with name)', path: 'assets/logo/logo.png' },
  { label: 'Astria GK', path: 'assets/logo/astria-gk-logo.png' },
  { label: 'No logo — print brand name', path: '' },
];
