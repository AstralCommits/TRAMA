export type CraftGalleryImage = {
  id: string;
  src: string;
  alt: string;
  creditLabel: string;
  creditUrl: string;
};

export type CraftDetails = {
  id: string;
  title: string;
  category: string;
  technique: string;
  description: string;
  imageNotice: string;
  images: CraftGalleryImage[];
};

export const demoCraft: CraftDetails = {
  id: 'referencias-croche',
  title: 'Bolsas artesanais em crochê',
  category: 'Acessórios artesanais',
  technique: 'Crochê com fios de malha',
  description:
    'Uma seleção demonstrativa de bolsas em crochê para apresentar texturas, pontos e combinações de cores. A galeria ilustra como o comprador poderá observar os detalhes de acabamento antes de conversar com o artesão.',
  imageNotice:
    'Galeria demonstrativa: as fotografias mostram peças de referência diferentes e não representam variações de um mesmo produto. Substitua-as por imagens autorizadas do item cadastrado.',
  images: [
    {
      id: 'croche-azul',
      src: 'https://acdn-us.mitiendanube.com/stores/005/288/339/products/22-8448eac8a84fbca04d17709035380706-1024-1024.webp',
      alt: 'Bolsa artesanal de crochê azul royal com alça de corrente dourada e aba em tom caramelo.',
      creditLabel: 'Amorino Fios — referência azul',
      creditUrl: 'https://www.amorinofios.com.br/produtos/fio-de-malha-premium-azul-royal-26mm/',
    },
    {
      id: 'croche-rosa',
      src: 'https://acdn-us.mitiendanube.com/stores/005/288/339/products/8-4d44f336abbeb060e817654004733890-1024-1024.webp',
      alt: 'Bolsa artesanal de crochê rosa claro com pontos largos e alça de mão.',
      creditLabel: 'Amorino Fios — referência rosa',
      creditUrl: 'https://www.amorinofios.com.br/produtos/fio-de-malha-premium-bale-rosa-36mm/',
    },
    {
      id: 'croche-verde',
      src: 'https://acdn-us.mitiendanube.com/stores/005/288/339/products/2-4f255ccd933e37a71217700410459121-1024-1024.webp',
      alt: 'Bolsa artesanal de crochê verde militar com alça trançada e tassel lateral.',
      creditLabel: 'Amorino Fios — referência verde',
      creditUrl: 'https://www.amorinofios.com.br/produtos/fio-de-malha-premium-verde-militar-36mm/',
    },
  ],
};
