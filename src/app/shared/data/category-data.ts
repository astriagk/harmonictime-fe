import { ICategoryType } from '../types/category-d-t';

const category_data: ICategoryType[] = [
  {
    id: 1,
    img: 'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/category_banner/5ef3aa73-06df-41ff-b5a6-56a6706cb492-1779444764206',
    parentTitle: 'Vintage',
    children: ['Omega'],
    smDesc: 'Rare classics and iconic timepieces from the golden era of watchmaking.',
  },
  {
    id: 2,
    img: 'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/category_banner/e0b9ec0a-b14e-470b-94a9-1da831cfdf4d-1779444823441',
    parentTitle: 'Heritage',
    children: ['Longines'],
    smDesc: 'Timeless craftsmanship inspired by generations of horological tradition.',
  },
  {
    id: 3,
    img: 'https://harmonic-time.s3.us-east-1.amazonaws.com/site-content/category_banner/2a1129b3-a688-4b33-98ac-8eeb70b641d7-1779444886723',
    parentTitle: 'Timeless',
    children: ['Rolex'],
    smDesc: 'Elegant watches designed to remain iconic across every generation.',
  },
];

export default category_data;
