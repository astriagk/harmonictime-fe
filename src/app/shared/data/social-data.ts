export type ISocial =  {
  link: string;
  icon: string;
  name: string;
}

const social_links:ISocial[] = [
  {
    link: "https://www.instagram.com/krono.square/",
    icon: "fab fa-instagram",
    name: "Instagram",
  },
  {
    link: "https://x.com",
    icon: "fab fa-twitter",
    name: "X",
  },
  {
    link: "https://www.linkedin.com",
    icon: "fab fa-linkedin-in",
    name: "LinkedIn",
  },
]

export default social_links;
