import { IPolicyData } from '../types/policy-d-t';

// Each key is the route slug used in /pages/policy/:slug.
// Fill in `intro` and `sections` with the real copy when ready.
const policy_data: IPolicyData = {
  about: {
    title: 'About Us',
    intro:
      'We are a trusted online marketplace for buying, selling, and trading authentic watches. From vintage classics to modern luxury and everyday timepieces, our platform connects watch enthusiasts, collectors, and sellers across India with a secure and transparent experience.',
    sections: [
      {
        heading: 'Who We Are',
        content:
          'Our platform was created for watch lovers who value authenticity, quality, and trust. We make it easy for individuals and businesses to list, discover, and purchase pre-owned, unused, and brand-new watches in one place.',
      },
      {
        heading: 'What We Offer',
        content:
          'We provide a marketplace where users can buy and sell luxury, premium, vintage, and everyday watches with confidence. Every listing is reviewed to maintain platform quality and customer trust.',
      },
      {
        heading: 'Our Mission',
        content:
          'Our mission is to build India’s most trusted watch marketplace by offering secure transactions, verified listings, transparent communication, and excellent customer support.',
      },
    ],
  },

  careers: {
    title: 'Careers',
    intro:
      'Join our growing team and help us build the future of the online watch marketplace.',
    sections: [
      {
        heading: 'Why Work With Us',
        content:
          'We are building a modern platform for watch buyers and sellers with a strong focus on technology, trust, and customer experience.',
      },
      {
        heading: 'Open Opportunities',
        content:
          'We regularly hire for technology, operations, customer support, marketing, photography, authentication, and business development roles.',
      },
      {
        heading: 'How to Apply',
        content:
          'Send your resume and portfolio to our official careers email. Our team will review your application and contact shortlisted candidates.',
      },
    ],
  },

  delivery: {
    title: 'Delivery Information',
    intro:
      'We aim to deliver all orders safely and on time through trusted courier partners.',
    sections: [
      {
        heading: 'Delivery Timeline',
        content:
          'Orders are usually processed within 1–3 business days. Delivery timelines may vary depending on the seller location and customer delivery address.',
      },
      {
        heading: 'Order Tracking',
        content:
          'Customers will receive tracking details once the order has been shipped.',
      },
      {
        heading: 'Delivery Coverage',
        content:
          'We currently deliver across India. International shipping may be available for selected products.',
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    intro: 'Your privacy and personal information are important to us.',
    sections: [
      {
        heading: 'Information We Collect',
        content:
          'We may collect personal details such as name, email address, phone number, billing information, and delivery address during account registration or order placement.',
      },
      {
        heading: 'How We Use Information',
        content:
          'Your information is used to process orders, improve user experience, provide customer support, and maintain platform security.',
      },
      {
        heading: 'Data Protection',
        content:
          'We implement appropriate security measures to protect customer data from unauthorized access or misuse.',
      },
    ],
  },

  terms: {
    title: 'Terms & Conditions',
    intro:
      'By using our platform, you agree to comply with the following terms and conditions. These terms apply to all buyers and sellers on the platform.',
    sections: [
      {
        heading: 'Seller Terms',
        items: [
          'While listing a product, ensure the actual item is added with original pictures showing how it truly looks. Misleading images are not allowed.',
          'Payments will be withheld until the product is delivered. After confirmed delivery, withdrawal will be processed within 7 business days.',
          'Sellers must clearly mention their return policy in the product listing, stating what action will be taken in case of a return request.',
          'A 2% platform service charge will be deducted from the seller\'s withdrawal amount.',
          'GST is never deducted from your earnings. If you list a price exclusive of tax, 18% GST is collected from the buyer at checkout and paid to you in full along with your payout — it is your responsibility to remit it. If you list a tax-inclusive price, buyers pay exactly that price and the GST inside it remains yours to remit.',
          'The payment will be sent to the bank account added by the seller. It is the seller\'s responsibility to add accurate and correct bank details — we are not liable for errors.',
          'Before posting any product, sellers must take clear photos and videos of the item to avoid disputes or claims regarding its condition.',
        ],
      },
      {
        heading: 'Buyer Terms',
        items: [
          'Carefully review the product listing, description, and images before making a purchase. Sellers are verified by us before being allowed to list items.',
          'All payments are subject to a 2% platform service charge.',
          'The responsibility for the product\'s condition as described lies with the seller. Upon receiving the item, buyers must record an unboxing video and take photographs to support any future query or dispute.',
        ],
      },
      {
        heading: 'Platform Rights',
        content:
          'We reserve the right to remove listings, suspend accounts, or cancel orders if fraudulent activity or policy violations are detected.',
      },
    ],
  },

  shipping: {
    title: 'Shipping Policy',
    intro:
      'We partner with reliable courier services to ensure secure shipping.',
    sections: [
      {
        heading: 'Shipping Charges',
        content:
          'Shipping charges may vary depending on product value, package weight, delivery location, and seller preferences.',
      },
      {
        heading: 'Packaging',
        content:
          'All watches should be securely packed to prevent damage during transit.',
      },
      {
        heading: 'Delayed Shipments',
        content:
          'Unexpected delays due to weather conditions, courier issues, or public holidays may affect delivery timelines.',
      },
    ],
  },

  returns: {
    title: 'Returns & Refunds',
    intro:
      'We strive to provide a fair and transparent return and refund process.',
    sections: [
      {
        heading: 'Return Eligibility',
        content:
          'Customers may request a return if the product received is damaged, incorrect, or significantly different from the listing description.',
      },
      {
        heading: 'Return Window',
        content:
          'Return requests must be initiated within 3–7 days of delivery depending on the product category and seller policy.',
      },
      {
        heading: 'Refund Process',
        content:
          'Approved refunds will be processed to the original payment method within 5–10 business days after successful return verification.',
      },
    ],
  },

  stores: {
    title: 'Online Stores',
    intro: 'Explore trusted watch sellers and partner stores on our platform.',
    sections: [
      {
        heading: 'Verified Sellers',
        content:
          'We work with verified sellers and collectors to ensure customers have access to authentic and quality watches.',
      },
      {
        heading: 'Seller Benefits',
        content:
          'Sellers can reach a wider audience, manage listings easily, and securely sell watches through our platform.',
      },
      {
        heading: 'Become a Seller',
        content:
          'Individuals, collectors, and businesses can apply to become sellers by registering and completing the verification process.',
      },
    ],
  },
};

export default policy_data;
