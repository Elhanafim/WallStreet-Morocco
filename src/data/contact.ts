export const CONTACT = {
  phone: {
    display: '+33 7 43 52 76 04',
    raw: '+33743527604',
    href: 'tel:+33743527604',
  },
  whatsapp: {
    display: '+33 7 43 52 76 04',
    href: 'https://wa.me/33743527604',
    hrefWithMsg:
      'https://wa.me/33743527604?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20WallStreet%20Morocco.',
  },
  instagram: {
    handle: '@wallstreet.morocco',
    displayName: 'wallstreet.morocco',
    href: 'https://www.instagram.com/wallstreet.morocco?igsh=ZGd2YWg2MHo4azE=&utm_source=ig_contact_invite',
    hrefClean: 'https://www.instagram.com/wallstreet.morocco',
  },
  email: {
    display: 'mohamed345el@gmail.com',
    href: 'mailto:mohamed345el@gmail.com',
    subject: 'Contact WallStreet Morocco',
    hrefWithSubject: 'mailto:mohamed345el@gmail.com?subject=Contact%20WallStreet%20Morocco',
  },
  twitter: null,
} as const;
