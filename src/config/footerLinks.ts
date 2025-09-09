export type FooterItem = { label: string; href: string };
export type FooterSection = { title: string; items: FooterItem[] };

const tools: FooterItem[] = [
  { label: "Card Generator", href: "/generator" },
  { label: "Party Planner", href: "/party-planner" },
  { label: "Personalized Gifts", href: "/gift-guide" },
  { label: "Send Gifts Automatically", href: "/automation" },
];

const community: FooterItem[] = [
  { label: "Card Showcase", href: "/showcase" },
  { label: "Birthday Blog", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "Inspiration", href: "/inspiration" },
];

const company: FooterItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const sections: FooterSection[] = [
  { title: "Tools", items: tools },
  { title: "Community", items: community },
  { title: "Company", items: company },
];

export const footerLinks = sections;
export default footerLinks;
