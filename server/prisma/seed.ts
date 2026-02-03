import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'electronics', namePl: 'Elektronika', nameEn: 'Electronics', icon: 'Smartphone', slug: 'elektronika',
    children: [
      { name: 'phones', namePl: 'Telefony', nameEn: 'Phones', icon: 'Phone', slug: 'telefony' },
      { name: 'computers', namePl: 'Komputery', nameEn: 'Computers', icon: 'Laptop', slug: 'komputery' },
      { name: 'tv-audio', namePl: 'TV i Audio', nameEn: 'TV & Audio', icon: 'Tv', slug: 'tv-audio' },
      { name: 'gaming', namePl: 'Konsole i Gry', nameEn: 'Gaming', icon: 'Gamepad2', slug: 'konsole-gry' },
      { name: 'photo', namePl: 'Foto', nameEn: 'Photography', icon: 'Camera', slug: 'foto' },
    ],
  },
  {
    name: 'automotive', namePl: 'Motoryzacja', nameEn: 'Automotive', icon: 'Car', slug: 'motoryzacja',
    children: [
      { name: 'cars', namePl: 'Samochody', nameEn: 'Cars', icon: 'Car', slug: 'samochody' },
      { name: 'motorcycles', namePl: 'Motocykle', nameEn: 'Motorcycles', icon: 'Bike', slug: 'motocykle' },
      { name: 'parts', namePl: 'Czesci', nameEn: 'Parts', icon: 'Wrench', slug: 'czesci' },
    ],
  },
  {
    name: 'real-estate', namePl: 'Nieruchomosci', nameEn: 'Real Estate', icon: 'Home', slug: 'nieruchomosci',
    children: [
      { name: 'apartments', namePl: 'Mieszkania', nameEn: 'Apartments', icon: 'Building2', slug: 'mieszkania' },
      { name: 'houses', namePl: 'Domy', nameEn: 'Houses', icon: 'Home', slug: 'domy' },
      { name: 'land', namePl: 'Dzialki', nameEn: 'Land', icon: 'Map', slug: 'dzialki' },
    ],
  },
  {
    name: 'home-garden', namePl: 'Dom i Ogrod', nameEn: 'Home & Garden', icon: 'Sofa', slug: 'dom-ogrod',
    children: [
      { name: 'furniture', namePl: 'Meble', nameEn: 'Furniture', icon: 'Sofa', slug: 'meble' },
      { name: 'appliances', namePl: 'AGD', nameEn: 'Appliances', icon: 'Refrigerator', slug: 'agd' },
      { name: 'tools', namePl: 'Narzedzia', nameEn: 'Tools', icon: 'Hammer', slug: 'narzedzia' },
      { name: 'decor', namePl: 'Dekoracje', nameEn: 'Decor', icon: 'Paintbrush', slug: 'dekoracje' },
    ],
  },
  {
    name: 'fashion', namePl: 'Moda', nameEn: 'Fashion', icon: 'Shirt', slug: 'moda',
    children: [
      { name: 'women-clothing', namePl: 'Odziez damska', nameEn: 'Women Clothing', icon: 'Shirt', slug: 'odziez-damska' },
      { name: 'men-clothing', namePl: 'Odziez meska', nameEn: 'Men Clothing', icon: 'Shirt', slug: 'odziez-meska' },
      { name: 'shoes', namePl: 'Buty', nameEn: 'Shoes', icon: 'Footprints', slug: 'buty' },
      { name: 'accessories', namePl: 'Akcesoria', nameEn: 'Accessories', icon: 'Watch', slug: 'akcesoria' },
    ],
  },
  {
    name: 'sports', namePl: 'Sport i Hobby', nameEn: 'Sports & Hobbies', icon: 'Dumbbell', slug: 'sport-hobby',
    children: [
      { name: 'bikes', namePl: 'Rowery', nameEn: 'Bikes', icon: 'Bike', slug: 'rowery' },
      { name: 'gym', namePl: 'Silownia', nameEn: 'Gym', icon: 'Dumbbell', slug: 'silownia' },
      { name: 'instruments', namePl: 'Instrumenty', nameEn: 'Instruments', icon: 'Music', slug: 'instrumenty' },
      { name: 'games', namePl: 'Gry planszowe', nameEn: 'Board Games', icon: 'Dice5', slug: 'gry-planszowe' },
    ],
  },
  {
    name: 'kids', namePl: 'Dla dzieci', nameEn: 'For Kids', icon: 'Baby', slug: 'dla-dzieci',
    children: [
      { name: 'toys', namePl: 'Zabawki', nameEn: 'Toys', icon: 'ToyBrick', slug: 'zabawki' },
      { name: 'kids-clothing', namePl: 'Odziez dziecieca', nameEn: 'Kids Clothing', icon: 'Shirt', slug: 'odziez-dziecieca' },
      { name: 'strollers', namePl: 'Wozki', nameEn: 'Strollers', icon: 'Baby', slug: 'wozki' },
    ],
  },
  {
    name: 'jobs', namePl: 'Praca', nameEn: 'Jobs', icon: 'Briefcase', slug: 'praca',
    children: [
      { name: 'job-offers', namePl: 'Oferty pracy', nameEn: 'Job Offers', icon: 'Briefcase', slug: 'oferty-pracy' },
      { name: 'job-seeking', namePl: 'Szukam pracy', nameEn: 'Job Seeking', icon: 'Search', slug: 'szukam-pracy' },
    ],
  },
  {
    name: 'services', namePl: 'Uslugi', nameEn: 'Services', icon: 'HandHelping', slug: 'uslugi',
    children: [
      { name: 'renovations', namePl: 'Remonty', nameEn: 'Renovations', icon: 'Hammer', slug: 'remonty' },
      { name: 'transport', namePl: 'Transport', nameEn: 'Transport', icon: 'Truck', slug: 'transport' },
      { name: 'tutoring', namePl: 'Korepetycje', nameEn: 'Tutoring', icon: 'GraduationCap', slug: 'korepetycje' },
    ],
  },
  {
    name: 'other', namePl: 'Inne', nameEn: 'Other', icon: 'MoreHorizontal', slug: 'inne',
    children: [],
  },
];

async function main() {
  console.log('Seeding categories...');

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { namePl: cat.namePl, nameEn: cat.nameEn, icon: cat.icon },
      create: {
        name: cat.name,
        namePl: cat.namePl,
        nameEn: cat.nameEn,
        icon: cat.icon,
        slug: cat.slug,
      },
    });

    for (const child of cat.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { namePl: child.namePl, nameEn: child.nameEn, icon: child.icon, parentId: parent.id },
        create: {
          name: child.name,
          namePl: child.namePl,
          nameEn: child.nameEn,
          icon: child.icon,
          slug: child.slug,
          parentId: parent.id,
        },
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
