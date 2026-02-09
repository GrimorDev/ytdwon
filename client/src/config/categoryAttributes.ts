export interface AttributeOption {
  value: string;
  labelPl: string;
  labelEn: string;
}

export interface AttributeDefinition {
  key: string;
  type: 'text' | 'number' | 'select';
  labelPl: string;
  labelEn: string;
  required: boolean;
  filterable: boolean;
  showOnCard: boolean;
  options?: AttributeOption[];
  unit?: string;
  min?: number;
  max?: number;
}

export const CATEGORY_ATTRIBUTES: Record<string, AttributeDefinition[]> = {
  // ========== ELEKTRONIKA ==========
  telefony: [
    {
      key: 'brand', type: 'select', labelPl: 'Marka', labelEn: 'Brand',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'apple', labelPl: 'Apple', labelEn: 'Apple' },
        { value: 'samsung', labelPl: 'Samsung', labelEn: 'Samsung' },
        { value: 'xiaomi', labelPl: 'Xiaomi', labelEn: 'Xiaomi' },
        { value: 'huawei', labelPl: 'Huawei', labelEn: 'Huawei' },
        { value: 'oneplus', labelPl: 'OnePlus', labelEn: 'OnePlus' },
        { value: 'google', labelPl: 'Google', labelEn: 'Google' },
        { value: 'motorola', labelPl: 'Motorola', labelEn: 'Motorola' },
        { value: 'oppo', labelPl: 'Oppo', labelEn: 'Oppo' },
        { value: 'realme', labelPl: 'Realme', labelEn: 'Realme' },
        { value: 'nothing', labelPl: 'Nothing', labelEn: 'Nothing' },
        { value: 'other', labelPl: 'Inna', labelEn: 'Other' },
      ],
    },
    { key: 'model', type: 'text', labelPl: 'Model', labelEn: 'Model', required: false, filterable: false, showOnCard: false },
    {
      key: 'ram', type: 'select', labelPl: 'RAM', labelEn: 'RAM',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: '4', labelPl: '4 GB', labelEn: '4 GB' },
        { value: '6', labelPl: '6 GB', labelEn: '6 GB' },
        { value: '8', labelPl: '8 GB', labelEn: '8 GB' },
        { value: '12', labelPl: '12 GB', labelEn: '12 GB' },
        { value: '16', labelPl: '16 GB', labelEn: '16 GB' },
      ],
    },
    {
      key: 'storage', type: 'select', labelPl: 'Pamiec', labelEn: 'Storage',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '64', labelPl: '64 GB', labelEn: '64 GB' },
        { value: '128', labelPl: '128 GB', labelEn: '128 GB' },
        { value: '256', labelPl: '256 GB', labelEn: '256 GB' },
        { value: '512', labelPl: '512 GB', labelEn: '512 GB' },
        { value: '1024', labelPl: '1 TB', labelEn: '1 TB' },
      ],
    },
    { key: 'screenSize', type: 'number', labelPl: 'Ekran', labelEn: 'Screen', required: false, filterable: false, showOnCard: false, unit: 'cali', min: 4, max: 8 },
  ],

  komputery: [
    { key: 'processor', type: 'text', labelPl: 'Procesor', labelEn: 'Processor', required: false, filterable: false, showOnCard: true },
    {
      key: 'ram', type: 'select', labelPl: 'RAM', labelEn: 'RAM',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '4', labelPl: '4 GB', labelEn: '4 GB' },
        { value: '8', labelPl: '8 GB', labelEn: '8 GB' },
        { value: '16', labelPl: '16 GB', labelEn: '16 GB' },
        { value: '32', labelPl: '32 GB', labelEn: '32 GB' },
        { value: '64', labelPl: '64 GB', labelEn: '64 GB' },
        { value: '128', labelPl: '128 GB', labelEn: '128 GB' },
      ],
    },
    { key: 'gpu', type: 'text', labelPl: 'Karta graficzna', labelEn: 'GPU', required: false, filterable: false, showOnCard: false },
    {
      key: 'storage', type: 'select', labelPl: 'Dysk', labelEn: 'Storage',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '128', labelPl: '128 GB', labelEn: '128 GB' },
        { value: '256', labelPl: '256 GB', labelEn: '256 GB' },
        { value: '512', labelPl: '512 GB', labelEn: '512 GB' },
        { value: '1000', labelPl: '1 TB', labelEn: '1 TB' },
        { value: '2000', labelPl: '2 TB', labelEn: '2 TB' },
        { value: '4000', labelPl: '4 TB', labelEn: '4 TB' },
      ],
    },
    {
      key: 'storageType', type: 'select', labelPl: 'Typ dysku', labelEn: 'Storage type',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'ssd', labelPl: 'SSD', labelEn: 'SSD' },
        { value: 'hdd', labelPl: 'HDD', labelEn: 'HDD' },
        { value: 'ssd+hdd', labelPl: 'SSD + HDD', labelEn: 'SSD + HDD' },
      ],
    },
    { key: 'screenSize', type: 'number', labelPl: 'Ekran', labelEn: 'Screen', required: false, filterable: false, showOnCard: false, unit: 'cali', min: 10, max: 32 },
  ],

  'tv-audio': [
    {
      key: 'brand', type: 'select', labelPl: 'Marka', labelEn: 'Brand',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'samsung', labelPl: 'Samsung', labelEn: 'Samsung' },
        { value: 'lg', labelPl: 'LG', labelEn: 'LG' },
        { value: 'sony', labelPl: 'Sony', labelEn: 'Sony' },
        { value: 'philips', labelPl: 'Philips', labelEn: 'Philips' },
        { value: 'tcl', labelPl: 'TCL', labelEn: 'TCL' },
        { value: 'hisense', labelPl: 'Hisense', labelEn: 'Hisense' },
        { value: 'other', labelPl: 'Inna', labelEn: 'Other' },
      ],
    },
    { key: 'screenSize', type: 'number', labelPl: 'Ekran', labelEn: 'Screen', required: false, filterable: true, showOnCard: true, unit: 'cali', min: 20, max: 100 },
    {
      key: 'resolution', type: 'select', labelPl: 'Rozdzielczosc', labelEn: 'Resolution',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'hd', labelPl: 'HD', labelEn: 'HD' },
        { value: 'fhd', labelPl: 'Full HD', labelEn: 'Full HD' },
        { value: '4k', labelPl: '4K UHD', labelEn: '4K UHD' },
        { value: '8k', labelPl: '8K', labelEn: '8K' },
      ],
    },
  ],

  'konsole-gry': [
    {
      key: 'platform', type: 'select', labelPl: 'Platforma', labelEn: 'Platform',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'ps5', labelPl: 'PlayStation 5', labelEn: 'PlayStation 5' },
        { value: 'ps4', labelPl: 'PlayStation 4', labelEn: 'PlayStation 4' },
        { value: 'xsx', labelPl: 'Xbox Series X/S', labelEn: 'Xbox Series X/S' },
        { value: 'xone', labelPl: 'Xbox One', labelEn: 'Xbox One' },
        { value: 'switch', labelPl: 'Nintendo Switch', labelEn: 'Nintendo Switch' },
        { value: 'pc', labelPl: 'PC', labelEn: 'PC' },
      ],
    },
    {
      key: 'type', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'console', labelPl: 'Konsola', labelEn: 'Console' },
        { value: 'game', labelPl: 'Gra', labelEn: 'Game' },
        { value: 'accessory', labelPl: 'Akcesoria', labelEn: 'Accessory' },
      ],
    },
  ],

  // ========== MOTORYZACJA ==========
  samochody: [
    {
      key: 'make', type: 'select', labelPl: 'Marka', labelEn: 'Make',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'audi', labelPl: 'Audi', labelEn: 'Audi' },
        { value: 'bmw', labelPl: 'BMW', labelEn: 'BMW' },
        { value: 'citroen', labelPl: 'Citroen', labelEn: 'Citroen' },
        { value: 'fiat', labelPl: 'Fiat', labelEn: 'Fiat' },
        { value: 'ford', labelPl: 'Ford', labelEn: 'Ford' },
        { value: 'honda', labelPl: 'Honda', labelEn: 'Honda' },
        { value: 'hyundai', labelPl: 'Hyundai', labelEn: 'Hyundai' },
        { value: 'kia', labelPl: 'Kia', labelEn: 'Kia' },
        { value: 'mazda', labelPl: 'Mazda', labelEn: 'Mazda' },
        { value: 'mercedes', labelPl: 'Mercedes-Benz', labelEn: 'Mercedes-Benz' },
        { value: 'nissan', labelPl: 'Nissan', labelEn: 'Nissan' },
        { value: 'opel', labelPl: 'Opel', labelEn: 'Opel' },
        { value: 'peugeot', labelPl: 'Peugeot', labelEn: 'Peugeot' },
        { value: 'renault', labelPl: 'Renault', labelEn: 'Renault' },
        { value: 'seat', labelPl: 'Seat', labelEn: 'Seat' },
        { value: 'skoda', labelPl: 'Skoda', labelEn: 'Skoda' },
        { value: 'toyota', labelPl: 'Toyota', labelEn: 'Toyota' },
        { value: 'volkswagen', labelPl: 'Volkswagen', labelEn: 'Volkswagen' },
        { value: 'volvo', labelPl: 'Volvo', labelEn: 'Volvo' },
        { value: 'other', labelPl: 'Inna', labelEn: 'Other' },
      ],
    },
    { key: 'model', type: 'text', labelPl: 'Model', labelEn: 'Model', required: false, filterable: false, showOnCard: false },
    { key: 'year', type: 'number', labelPl: 'Rok produkcji', labelEn: 'Year', required: false, filterable: true, showOnCard: true, min: 1990, max: 2026 },
    { key: 'mileage', type: 'number', labelPl: 'Przebieg', labelEn: 'Mileage', required: false, filterable: true, showOnCard: true, unit: 'km' },
    {
      key: 'fuelType', type: 'select', labelPl: 'Paliwo', labelEn: 'Fuel type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'petrol', labelPl: 'Benzyna', labelEn: 'Petrol' },
        { value: 'diesel', labelPl: 'Diesel', labelEn: 'Diesel' },
        { value: 'lpg', labelPl: 'LPG', labelEn: 'LPG' },
        { value: 'electric', labelPl: 'Elektryczny', labelEn: 'Electric' },
        { value: 'hybrid', labelPl: 'Hybryda', labelEn: 'Hybrid' },
      ],
    },
    {
      key: 'transmission', type: 'select', labelPl: 'Skrzynia biegow', labelEn: 'Transmission',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'manual', labelPl: 'Manualna', labelEn: 'Manual' },
        { value: 'automatic', labelPl: 'Automatyczna', labelEn: 'Automatic' },
      ],
    },
    { key: 'engineSize', type: 'number', labelPl: 'Pojemnosc silnika', labelEn: 'Engine size', required: false, filterable: false, showOnCard: false, unit: 'cm3' },
    {
      key: 'bodyType', type: 'select', labelPl: 'Nadwozie', labelEn: 'Body type',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'sedan', labelPl: 'Sedan', labelEn: 'Sedan' },
        { value: 'kombi', labelPl: 'Kombi', labelEn: 'Estate' },
        { value: 'hatchback', labelPl: 'Hatchback', labelEn: 'Hatchback' },
        { value: 'suv', labelPl: 'SUV', labelEn: 'SUV' },
        { value: 'van', labelPl: 'Van', labelEn: 'Van' },
        { value: 'coupe', labelPl: 'Coupe', labelEn: 'Coupe' },
        { value: 'cabrio', labelPl: 'Kabriolet', labelEn: 'Convertible' },
      ],
    },
    { key: 'power', type: 'number', labelPl: 'Moc', labelEn: 'Power', required: false, filterable: true, showOnCard: false, unit: 'KM' },
  ],

  motocykle: [
    {
      key: 'make', type: 'select', labelPl: 'Marka', labelEn: 'Make',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'honda', labelPl: 'Honda', labelEn: 'Honda' },
        { value: 'yamaha', labelPl: 'Yamaha', labelEn: 'Yamaha' },
        { value: 'kawasaki', labelPl: 'Kawasaki', labelEn: 'Kawasaki' },
        { value: 'suzuki', labelPl: 'Suzuki', labelEn: 'Suzuki' },
        { value: 'bmw', labelPl: 'BMW', labelEn: 'BMW' },
        { value: 'ducati', labelPl: 'Ducati', labelEn: 'Ducati' },
        { value: 'ktm', labelPl: 'KTM', labelEn: 'KTM' },
        { value: 'harley', labelPl: 'Harley-Davidson', labelEn: 'Harley-Davidson' },
        { value: 'other', labelPl: 'Inna', labelEn: 'Other' },
      ],
    },
    { key: 'model', type: 'text', labelPl: 'Model', labelEn: 'Model', required: false, filterable: false, showOnCard: false },
    { key: 'year', type: 'number', labelPl: 'Rok produkcji', labelEn: 'Year', required: false, filterable: true, showOnCard: true, min: 1990, max: 2026 },
    { key: 'mileage', type: 'number', labelPl: 'Przebieg', labelEn: 'Mileage', required: false, filterable: true, showOnCard: true, unit: 'km' },
    { key: 'engineSize', type: 'number', labelPl: 'Pojemnosc', labelEn: 'Engine size', required: false, filterable: false, showOnCard: false, unit: 'cm3' },
    {
      key: 'bikeType', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'sport', labelPl: 'Sportowy', labelEn: 'Sport' },
        { value: 'touring', labelPl: 'Turystyczny', labelEn: 'Touring' },
        { value: 'naked', labelPl: 'Naked', labelEn: 'Naked' },
        { value: 'chopper', labelPl: 'Chopper', labelEn: 'Chopper' },
        { value: 'enduro', labelPl: 'Enduro', labelEn: 'Enduro' },
        { value: 'cross', labelPl: 'Cross', labelEn: 'Cross' },
        { value: 'scooter', labelPl: 'Skuter', labelEn: 'Scooter' },
      ],
    },
  ],

  // ========== NIERUCHOMOSCI ==========
  mieszkania: [
    { key: 'area', type: 'number', labelPl: 'Powierzchnia', labelEn: 'Area', required: false, filterable: true, showOnCard: true, unit: 'm2', min: 10, max: 500 },
    { key: 'rooms', type: 'number', labelPl: 'Pokoje', labelEn: 'Rooms', required: false, filterable: true, showOnCard: true, min: 1, max: 10 },
    { key: 'floor', type: 'number', labelPl: 'Pietro', labelEn: 'Floor', required: false, filterable: false, showOnCard: false, min: 0, max: 50 },
    {
      key: 'transactionType', type: 'select', labelPl: 'Typ transakcji', labelEn: 'Transaction type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'sale', labelPl: 'Sprzedaz', labelEn: 'Sale' },
        { value: 'rent', labelPl: 'Wynajem', labelEn: 'Rent' },
      ],
    },
  ],

  domy: [
    { key: 'area', type: 'number', labelPl: 'Powierzchnia', labelEn: 'Area', required: false, filterable: true, showOnCard: true, unit: 'm2', min: 30, max: 2000 },
    { key: 'plotArea', type: 'number', labelPl: 'Dzialka', labelEn: 'Plot area', required: false, filterable: true, showOnCard: true, unit: 'm2', min: 100, max: 100000 },
    { key: 'rooms', type: 'number', labelPl: 'Pokoje', labelEn: 'Rooms', required: false, filterable: true, showOnCard: true, min: 1, max: 20 },
    { key: 'yearBuilt', type: 'number', labelPl: 'Rok budowy', labelEn: 'Year built', required: false, filterable: true, showOnCard: false, min: 1900, max: 2026 },
    {
      key: 'transactionType', type: 'select', labelPl: 'Typ transakcji', labelEn: 'Transaction type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'sale', labelPl: 'Sprzedaz', labelEn: 'Sale' },
        { value: 'rent', labelPl: 'Wynajem', labelEn: 'Rent' },
      ],
    },
  ],

  dzialki: [
    { key: 'area', type: 'number', labelPl: 'Powierzchnia', labelEn: 'Area', required: false, filterable: true, showOnCard: true, unit: 'm2', min: 100, max: 1000000 },
    {
      key: 'plotType', type: 'select', labelPl: 'Typ dzialki', labelEn: 'Plot type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'building', labelPl: 'Budowlana', labelEn: 'Building' },
        { value: 'agricultural', labelPl: 'Rolna', labelEn: 'Agricultural' },
        { value: 'recreational', labelPl: 'Rekreacyjna', labelEn: 'Recreational' },
        { value: 'commercial', labelPl: 'Komercyjna', labelEn: 'Commercial' },
      ],
    },
  ],

  // ========== DOM I OGROD ==========
  meble: [
    {
      key: 'furnitureType', type: 'select', labelPl: 'Typ mebla', labelEn: 'Furniture type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'sofa', labelPl: 'Sofa/Kanapa', labelEn: 'Sofa' },
        { value: 'table', labelPl: 'Stol', labelEn: 'Table' },
        { value: 'chair', labelPl: 'Krzeslo', labelEn: 'Chair' },
        { value: 'wardrobe', labelPl: 'Szafa', labelEn: 'Wardrobe' },
        { value: 'bed', labelPl: 'Lozko', labelEn: 'Bed' },
        { value: 'desk', labelPl: 'Biurko', labelEn: 'Desk' },
        { value: 'shelf', labelPl: 'Polka/Regal', labelEn: 'Shelf' },
        { value: 'other', labelPl: 'Inny', labelEn: 'Other' },
      ],
    },
    {
      key: 'material', type: 'select', labelPl: 'Material', labelEn: 'Material',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'wood', labelPl: 'Drewno', labelEn: 'Wood' },
        { value: 'metal', labelPl: 'Metal', labelEn: 'Metal' },
        { value: 'glass', labelPl: 'Szklo', labelEn: 'Glass' },
        { value: 'fabric', labelPl: 'Tkanina', labelEn: 'Fabric' },
        { value: 'plastic', labelPl: 'Plastik', labelEn: 'Plastic' },
      ],
    },
  ],

  agd: [
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
    {
      key: 'applianceType', type: 'select', labelPl: 'Typ urzadzenia', labelEn: 'Appliance type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'washer', labelPl: 'Pralka', labelEn: 'Washing machine' },
        { value: 'fridge', labelPl: 'Lodowka', labelEn: 'Refrigerator' },
        { value: 'dishwasher', labelPl: 'Zmywarka', labelEn: 'Dishwasher' },
        { value: 'oven', labelPl: 'Piekarnik', labelEn: 'Oven' },
        { value: 'cooker', labelPl: 'Kuchenka', labelEn: 'Cooker' },
        { value: 'vacuum', labelPl: 'Odkurzacz', labelEn: 'Vacuum cleaner' },
        { value: 'dryer', labelPl: 'Suszarka', labelEn: 'Dryer' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    {
      key: 'energyClass', type: 'select', labelPl: 'Klasa energetyczna', labelEn: 'Energy class',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'a+++', labelPl: 'A+++', labelEn: 'A+++' },
        { value: 'a++', labelPl: 'A++', labelEn: 'A++' },
        { value: 'a+', labelPl: 'A+', labelEn: 'A+' },
        { value: 'a', labelPl: 'A', labelEn: 'A' },
        { value: 'b', labelPl: 'B', labelEn: 'B' },
        { value: 'c', labelPl: 'C', labelEn: 'C' },
      ],
    },
  ],

  // ========== MODA ==========
  'odziez-damska': [
    {
      key: 'size', type: 'select', labelPl: 'Rozmiar', labelEn: 'Size',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'xs', labelPl: 'XS', labelEn: 'XS' },
        { value: 's', labelPl: 'S', labelEn: 'S' },
        { value: 'm', labelPl: 'M', labelEn: 'M' },
        { value: 'l', labelPl: 'L', labelEn: 'L' },
        { value: 'xl', labelPl: 'XL', labelEn: 'XL' },
        { value: 'xxl', labelPl: 'XXL', labelEn: 'XXL' },
        { value: '3xl', labelPl: '3XL', labelEn: '3XL' },
      ],
    },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
  ],

  'odziez-meska': [
    {
      key: 'size', type: 'select', labelPl: 'Rozmiar', labelEn: 'Size',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'xs', labelPl: 'XS', labelEn: 'XS' },
        { value: 's', labelPl: 'S', labelEn: 'S' },
        { value: 'm', labelPl: 'M', labelEn: 'M' },
        { value: 'l', labelPl: 'L', labelEn: 'L' },
        { value: 'xl', labelPl: 'XL', labelEn: 'XL' },
        { value: 'xxl', labelPl: 'XXL', labelEn: 'XXL' },
        { value: '3xl', labelPl: '3XL', labelEn: '3XL' },
      ],
    },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
  ],

  buty: [
    { key: 'shoeSize', type: 'number', labelPl: 'Rozmiar', labelEn: 'Size', required: false, filterable: true, showOnCard: true, min: 35, max: 50 },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
    {
      key: 'shoeType', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'sport', labelPl: 'Sportowe', labelEn: 'Sport' },
        { value: 'formal', labelPl: 'Wizytowe', labelEn: 'Formal' },
        { value: 'casual', labelPl: 'Casual', labelEn: 'Casual' },
        { value: 'boots', labelPl: 'Botki/Kozaki', labelEn: 'Boots' },
        { value: 'sandals', labelPl: 'Sandaly', labelEn: 'Sandals' },
      ],
    },
  ],

  // ========== SPORT ==========
  rowery: [
    {
      key: 'bikeType', type: 'select', labelPl: 'Typ roweru', labelEn: 'Bike type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'mountain', labelPl: 'Gorski', labelEn: 'Mountain' },
        { value: 'road', labelPl: 'Szosowy', labelEn: 'Road' },
        { value: 'city', labelPl: 'Miejski', labelEn: 'City' },
        { value: 'trekking', labelPl: 'Trekkingowy', labelEn: 'Trekking' },
        { value: 'electric', labelPl: 'Elektryczny', labelEn: 'Electric' },
        { value: 'bmx', labelPl: 'BMX', labelEn: 'BMX' },
        { value: 'kids', labelPl: 'Dzieciecy', labelEn: 'Kids' },
        { value: 'other', labelPl: 'Inny', labelEn: 'Other' },
      ],
    },
    {
      key: 'frameSize', type: 'select', labelPl: 'Rozmiar ramy', labelEn: 'Frame size',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'xs', labelPl: 'XS (14-15")', labelEn: 'XS (14-15")' },
        { value: 's', labelPl: 'S (16-17")', labelEn: 'S (16-17")' },
        { value: 'm', labelPl: 'M (18-19")', labelEn: 'M (18-19")' },
        { value: 'l', labelPl: 'L (20-21")', labelEn: 'L (20-21")' },
        { value: 'xl', labelPl: 'XL (22+")', labelEn: 'XL (22+")' },
      ],
    },
    { key: 'wheelSize', type: 'number', labelPl: 'Kola', labelEn: 'Wheel size', required: false, filterable: true, showOnCard: true, unit: 'cali', min: 12, max: 29 },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
  ],

  'sprzet-sportowy': [
    {
      key: 'sportType', type: 'select', labelPl: 'Dyscyplina', labelEn: 'Sport',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'fitness', labelPl: 'Fitness/Silownia', labelEn: 'Fitness/Gym' },
        { value: 'running', labelPl: 'Bieganie', labelEn: 'Running' },
        { value: 'swimming', labelPl: 'Plywanie', labelEn: 'Swimming' },
        { value: 'skiing', labelPl: 'Narciarstwo', labelEn: 'Skiing' },
        { value: 'snowboard', labelPl: 'Snowboard', labelEn: 'Snowboard' },
        { value: 'football', labelPl: 'Pilka nozna', labelEn: 'Football' },
        { value: 'tennis', labelPl: 'Tenis', labelEn: 'Tennis' },
        { value: 'climbing', labelPl: 'Wspinaczka', labelEn: 'Climbing' },
        { value: 'martial', labelPl: 'Sztuki walki', labelEn: 'Martial arts' },
        { value: 'other', labelPl: 'Inny', labelEn: 'Other' },
      ],
    },
  ],

  // ========== DLA DZIECI ==========
  zabawki: [
    {
      key: 'ageGroup', type: 'select', labelPl: 'Wiek dziecka', labelEn: 'Age group',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '0-1', labelPl: '0-1 rok', labelEn: '0-1 year' },
        { value: '1-3', labelPl: '1-3 lata', labelEn: '1-3 years' },
        { value: '3-6', labelPl: '3-6 lat', labelEn: '3-6 years' },
        { value: '6-12', labelPl: '6-12 lat', labelEn: '6-12 years' },
        { value: '12+', labelPl: '12+ lat', labelEn: '12+ years' },
      ],
    },
    {
      key: 'toyType', type: 'select', labelPl: 'Typ zabawki', labelEn: 'Toy type',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'educational', labelPl: 'Edukacyjne', labelEn: 'Educational' },
        { value: 'construction', labelPl: 'Klocki/Konstrukcyjne', labelEn: 'Building blocks' },
        { value: 'dolls', labelPl: 'Lalki/Figurki', labelEn: 'Dolls/Figures' },
        { value: 'vehicles', labelPl: 'Pojazdy', labelEn: 'Vehicles' },
        { value: 'outdoor', labelPl: 'Ogrodowe/Plenerowe', labelEn: 'Outdoor' },
        { value: 'board', labelPl: 'Planszowe', labelEn: 'Board games' },
        { value: 'electronic', labelPl: 'Elektroniczne', labelEn: 'Electronic' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
  ],

  'odziez-dziecieca': [
    {
      key: 'size', type: 'select', labelPl: 'Rozmiar', labelEn: 'Size',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '56', labelPl: '56 (0-2 mies.)', labelEn: '56 (0-2 mo.)' },
        { value: '62', labelPl: '62 (2-4 mies.)', labelEn: '62 (2-4 mo.)' },
        { value: '68', labelPl: '68 (4-6 mies.)', labelEn: '68 (4-6 mo.)' },
        { value: '74', labelPl: '74 (6-9 mies.)', labelEn: '74 (6-9 mo.)' },
        { value: '80', labelPl: '80 (9-12 mies.)', labelEn: '80 (9-12 mo.)' },
        { value: '86', labelPl: '86 (1-1.5 roku)', labelEn: '86 (1-1.5 yr)' },
        { value: '92', labelPl: '92 (1.5-2 lata)', labelEn: '92 (1.5-2 yr)' },
        { value: '98', labelPl: '98 (2-3 lata)', labelEn: '98 (2-3 yr)' },
        { value: '104-116', labelPl: '104-116 (3-6 lat)', labelEn: '104-116 (3-6 yr)' },
        { value: '122-140', labelPl: '122-140 (6-10 lat)', labelEn: '122-140 (6-10 yr)' },
        { value: '146-164', labelPl: '146-164 (10-14 lat)', labelEn: '146-164 (10-14 yr)' },
      ],
    },
    {
      key: 'gender', type: 'select', labelPl: 'Plec', labelEn: 'Gender',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'boy', labelPl: 'Chlopiec', labelEn: 'Boy' },
        { value: 'girl', labelPl: 'Dziewczynka', labelEn: 'Girl' },
        { value: 'unisex', labelPl: 'Unisex', labelEn: 'Unisex' },
      ],
    },
  ],

  wozki: [
    {
      key: 'strollerType', type: 'select', labelPl: 'Typ wozka', labelEn: 'Stroller type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'deep', labelPl: 'Gleboki', labelEn: 'Deep' },
        { value: 'spacerowy', labelPl: 'Spacerowy', labelEn: 'Stroller' },
        { value: 'wielofunkcyjny', labelPl: 'Wielofunkcyjny', labelEn: 'Multi-function' },
        { value: 'twin', labelPl: 'Blizniacy', labelEn: 'Twin' },
        { value: 'jogger', labelPl: 'Jogger', labelEn: 'Jogger' },
      ],
    },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
  ],

  // ========== OGROD I NARZEDZIA ==========
  narzedzia: [
    {
      key: 'toolType', type: 'select', labelPl: 'Typ narzedzia', labelEn: 'Tool type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'power', labelPl: 'Elektryczne', labelEn: 'Power tools' },
        { value: 'hand', labelPl: 'Reczne', labelEn: 'Hand tools' },
        { value: 'garden', labelPl: 'Ogrodowe', labelEn: 'Garden tools' },
        { value: 'measuring', labelPl: 'Pomiarowe', labelEn: 'Measuring' },
        { value: 'welding', labelPl: 'Spawalnicze', labelEn: 'Welding' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    {
      key: 'powerSource', type: 'select', labelPl: 'Zasilanie', labelEn: 'Power source',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'electric', labelPl: 'Elektryczne (230V)', labelEn: 'Electric (230V)' },
        { value: 'battery', labelPl: 'Akumulatorowe', labelEn: 'Battery' },
        { value: 'petrol', labelPl: 'Spalinowe', labelEn: 'Petrol' },
        { value: 'manual', labelPl: 'Reczne', labelEn: 'Manual' },
      ],
    },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
  ],

  // ========== ZWIERZETA ==========
  psy: [
    {
      key: 'adType', type: 'select', labelPl: 'Typ ogloszenia', labelEn: 'Ad type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'sale', labelPl: 'Sprzedaz', labelEn: 'Sale' },
        { value: 'adoption', labelPl: 'Adopcja', labelEn: 'Adoption' },
        { value: 'stud', labelPl: 'Krycie', labelEn: 'Stud' },
        { value: 'lost', labelPl: 'Zaginiony', labelEn: 'Lost' },
        { value: 'found', labelPl: 'Znaleziony', labelEn: 'Found' },
      ],
    },
    { key: 'breed', type: 'text', labelPl: 'Rasa', labelEn: 'Breed', required: false, filterable: false, showOnCard: true },
    { key: 'age', type: 'text', labelPl: 'Wiek', labelEn: 'Age', required: false, filterable: false, showOnCard: true },
  ],

  koty: [
    {
      key: 'adType', type: 'select', labelPl: 'Typ ogloszenia', labelEn: 'Ad type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'sale', labelPl: 'Sprzedaz', labelEn: 'Sale' },
        { value: 'adoption', labelPl: 'Adopcja', labelEn: 'Adoption' },
        { value: 'lost', labelPl: 'Zaginiony', labelEn: 'Lost' },
        { value: 'found', labelPl: 'Znaleziony', labelEn: 'Found' },
      ],
    },
    { key: 'breed', type: 'text', labelPl: 'Rasa', labelEn: 'Breed', required: false, filterable: false, showOnCard: true },
    { key: 'age', type: 'text', labelPl: 'Wiek', labelEn: 'Age', required: false, filterable: false, showOnCard: true },
  ],

  // ========== ZDROWIE I URODA ==========
  zdrowie: [
    {
      key: 'healthType', type: 'select', labelPl: 'Kategoria', labelEn: 'Category',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'supplements', labelPl: 'Suplementy', labelEn: 'Supplements' },
        { value: 'equipment', labelPl: 'Sprzet medyczny', labelEn: 'Medical equipment' },
        { value: 'cosmetics', labelPl: 'Kosmetyki', labelEn: 'Cosmetics' },
        { value: 'perfume', labelPl: 'Perfumy', labelEn: 'Perfume' },
        { value: 'hair', labelPl: 'Pielegnacja wlosow', labelEn: 'Hair care' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
  ],

  // ========== FOTOGRAFIA ==========
  fotografia: [
    {
      key: 'cameraType', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'dslr', labelPl: 'Lustrzanka (DSLR)', labelEn: 'DSLR' },
        { value: 'mirrorless', labelPl: 'Bezlusterkowy', labelEn: 'Mirrorless' },
        { value: 'compact', labelPl: 'Kompaktowy', labelEn: 'Compact' },
        { value: 'action', labelPl: 'Kamera sportowa', labelEn: 'Action camera' },
        { value: 'lens', labelPl: 'Obiektyw', labelEn: 'Lens' },
        { value: 'drone', labelPl: 'Dron', labelEn: 'Drone' },
        { value: 'accessory', labelPl: 'Akcesoria', labelEn: 'Accessory' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    {
      key: 'brand', type: 'select', labelPl: 'Marka', labelEn: 'Brand',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'canon', labelPl: 'Canon', labelEn: 'Canon' },
        { value: 'nikon', labelPl: 'Nikon', labelEn: 'Nikon' },
        { value: 'sony', labelPl: 'Sony', labelEn: 'Sony' },
        { value: 'fujifilm', labelPl: 'Fujifilm', labelEn: 'Fujifilm' },
        { value: 'panasonic', labelPl: 'Panasonic', labelEn: 'Panasonic' },
        { value: 'olympus', labelPl: 'Olympus', labelEn: 'Olympus' },
        { value: 'gopro', labelPl: 'GoPro', labelEn: 'GoPro' },
        { value: 'dji', labelPl: 'DJI', labelEn: 'DJI' },
        { value: 'other', labelPl: 'Inna', labelEn: 'Other' },
      ],
    },
  ],

  // ========== LAPTOPY / TABLETY ==========
  laptopy: [
    {
      key: 'brand', type: 'select', labelPl: 'Marka', labelEn: 'Brand',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'apple', labelPl: 'Apple', labelEn: 'Apple' },
        { value: 'lenovo', labelPl: 'Lenovo', labelEn: 'Lenovo' },
        { value: 'hp', labelPl: 'HP', labelEn: 'HP' },
        { value: 'dell', labelPl: 'Dell', labelEn: 'Dell' },
        { value: 'asus', labelPl: 'Asus', labelEn: 'Asus' },
        { value: 'acer', labelPl: 'Acer', labelEn: 'Acer' },
        { value: 'msi', labelPl: 'MSI', labelEn: 'MSI' },
        { value: 'huawei', labelPl: 'Huawei', labelEn: 'Huawei' },
        { value: 'other', labelPl: 'Inna', labelEn: 'Other' },
      ],
    },
    { key: 'processor', type: 'text', labelPl: 'Procesor', labelEn: 'Processor', required: false, filterable: false, showOnCard: true },
    {
      key: 'ram', type: 'select', labelPl: 'RAM', labelEn: 'RAM',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '4', labelPl: '4 GB', labelEn: '4 GB' },
        { value: '8', labelPl: '8 GB', labelEn: '8 GB' },
        { value: '16', labelPl: '16 GB', labelEn: '16 GB' },
        { value: '32', labelPl: '32 GB', labelEn: '32 GB' },
        { value: '64', labelPl: '64 GB', labelEn: '64 GB' },
      ],
    },
    {
      key: 'storage', type: 'select', labelPl: 'Dysk', labelEn: 'Storage',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '128', labelPl: '128 GB', labelEn: '128 GB' },
        { value: '256', labelPl: '256 GB', labelEn: '256 GB' },
        { value: '512', labelPl: '512 GB', labelEn: '512 GB' },
        { value: '1000', labelPl: '1 TB', labelEn: '1 TB' },
        { value: '2000', labelPl: '2 TB', labelEn: '2 TB' },
      ],
    },
    { key: 'screenSize', type: 'number', labelPl: 'Ekran', labelEn: 'Screen', required: false, filterable: true, showOnCard: true, unit: 'cali', min: 11, max: 18 },
  ],

  tablety: [
    {
      key: 'brand', type: 'select', labelPl: 'Marka', labelEn: 'Brand',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'apple', labelPl: 'Apple (iPad)', labelEn: 'Apple (iPad)' },
        { value: 'samsung', labelPl: 'Samsung', labelEn: 'Samsung' },
        { value: 'lenovo', labelPl: 'Lenovo', labelEn: 'Lenovo' },
        { value: 'huawei', labelPl: 'Huawei', labelEn: 'Huawei' },
        { value: 'xiaomi', labelPl: 'Xiaomi', labelEn: 'Xiaomi' },
        { value: 'other', labelPl: 'Inny', labelEn: 'Other' },
      ],
    },
    {
      key: 'storage', type: 'select', labelPl: 'Pamiec', labelEn: 'Storage',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '32', labelPl: '32 GB', labelEn: '32 GB' },
        { value: '64', labelPl: '64 GB', labelEn: '64 GB' },
        { value: '128', labelPl: '128 GB', labelEn: '128 GB' },
        { value: '256', labelPl: '256 GB', labelEn: '256 GB' },
        { value: '512', labelPl: '512 GB', labelEn: '512 GB' },
        { value: '1024', labelPl: '1 TB', labelEn: '1 TB' },
      ],
    },
    { key: 'screenSize', type: 'number', labelPl: 'Ekran', labelEn: 'Screen', required: false, filterable: true, showOnCard: true, unit: 'cali', min: 7, max: 13 },
  ],

  // ========== SLUCHAWKI / GLOSNIKI ==========
  sluchawki: [
    {
      key: 'headphoneType', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'over-ear', labelPl: 'Nauszne', labelEn: 'Over-ear' },
        { value: 'on-ear', labelPl: 'Na ucho', labelEn: 'On-ear' },
        { value: 'in-ear', labelPl: 'Douszne', labelEn: 'In-ear' },
        { value: 'tws', labelPl: 'TWS (bezprzewodowe)', labelEn: 'TWS (wireless)' },
      ],
    },
    {
      key: 'connectivity', type: 'select', labelPl: 'Lacznosc', labelEn: 'Connectivity',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'wireless', labelPl: 'Bezprzewodowe', labelEn: 'Wireless' },
        { value: 'wired', labelPl: 'Przewodowe', labelEn: 'Wired' },
        { value: 'both', labelPl: 'Obie opcje', labelEn: 'Both' },
      ],
    },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
  ],

  // ========== CZESCI SAMOCHODOWE ==========
  czesci: [
    {
      key: 'partType', type: 'select', labelPl: 'Typ czesci', labelEn: 'Part type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'engine', labelPl: 'Silnik/Uklad napedowy', labelEn: 'Engine/Drivetrain' },
        { value: 'body', labelPl: 'Karoseria/Nadwozie', labelEn: 'Body' },
        { value: 'interior', labelPl: 'Wnetrze', labelEn: 'Interior' },
        { value: 'electrical', labelPl: 'Elektryka', labelEn: 'Electrical' },
        { value: 'suspension', labelPl: 'Zawieszenie', labelEn: 'Suspension' },
        { value: 'brakes', labelPl: 'Hamulce', labelEn: 'Brakes' },
        { value: 'tires', labelPl: 'Opony/Felgi', labelEn: 'Tires/Rims' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    { key: 'carMake', type: 'text', labelPl: 'Marka samochodu', labelEn: 'Car make', required: false, filterable: false, showOnCard: true },
    { key: 'carModel', type: 'text', labelPl: 'Model samochodu', labelEn: 'Car model', required: false, filterable: false, showOnCard: false },
  ],

  // ========== KSIAZKI / MUZYKA ==========
  ksiazki: [
    {
      key: 'genre', type: 'select', labelPl: 'Gatunek', labelEn: 'Genre',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'fiction', labelPl: 'Beletrystyka', labelEn: 'Fiction' },
        { value: 'nonfiction', labelPl: 'Literatura faktu', labelEn: 'Non-fiction' },
        { value: 'scifi', labelPl: 'Sci-Fi/Fantasy', labelEn: 'Sci-Fi/Fantasy' },
        { value: 'crime', labelPl: 'Kryminal/Thriller', labelEn: 'Crime/Thriller' },
        { value: 'romance', labelPl: 'Romans', labelEn: 'Romance' },
        { value: 'kids', labelPl: 'Dla dzieci', labelEn: 'For kids' },
        { value: 'academic', labelPl: 'Naukowe/Akademickie', labelEn: 'Academic' },
        { value: 'comic', labelPl: 'Komiksy/Manga', labelEn: 'Comics/Manga' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    {
      key: 'bookFormat', type: 'select', labelPl: 'Format', labelEn: 'Format',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'hardcover', labelPl: 'Twarda okladka', labelEn: 'Hardcover' },
        { value: 'paperback', labelPl: 'Miekka okladka', labelEn: 'Paperback' },
        { value: 'ebook', labelPl: 'E-book', labelEn: 'E-book' },
        { value: 'audiobook', labelPl: 'Audiobook', labelEn: 'Audiobook' },
      ],
    },
    {
      key: 'language', type: 'select', labelPl: 'Jezyk', labelEn: 'Language',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'pl', labelPl: 'Polski', labelEn: 'Polish' },
        { value: 'en', labelPl: 'Angielski', labelEn: 'English' },
        { value: 'de', labelPl: 'Niemiecki', labelEn: 'German' },
        { value: 'other', labelPl: 'Inny', labelEn: 'Other' },
      ],
    },
  ],

  muzyka: [
    {
      key: 'musicType', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'instrument', labelPl: 'Instrument', labelEn: 'Instrument' },
        { value: 'vinyl', labelPl: 'Plyta winylowa', labelEn: 'Vinyl' },
        { value: 'cd', labelPl: 'CD', labelEn: 'CD' },
        { value: 'equipment', labelPl: 'Sprzet DJ/Studio', labelEn: 'DJ/Studio equipment' },
        { value: 'accessory', labelPl: 'Akcesoria', labelEn: 'Accessory' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    {
      key: 'instrumentType', type: 'select', labelPl: 'Typ instrumentu', labelEn: 'Instrument type',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'guitar', labelPl: 'Gitara', labelEn: 'Guitar' },
        { value: 'piano', labelPl: 'Pianino/Keyboard', labelEn: 'Piano/Keyboard' },
        { value: 'drums', labelPl: 'Perkusja', labelEn: 'Drums' },
        { value: 'wind', labelPl: 'Dete', labelEn: 'Wind' },
        { value: 'string', labelPl: 'Smyczkowe', labelEn: 'String' },
        { value: 'other', labelPl: 'Inny', labelEn: 'Other' },
      ],
    },
  ],

  // ========== AKCESORIA ==========
  zegarki: [
    {
      key: 'watchType', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'smart', labelPl: 'Smartwatch', labelEn: 'Smartwatch' },
        { value: 'analog', labelPl: 'Analogowy', labelEn: 'Analog' },
        { value: 'digital', labelPl: 'Cyfrowy', labelEn: 'Digital' },
        { value: 'luxury', labelPl: 'Luksusowy', labelEn: 'Luxury' },
      ],
    },
    {
      key: 'brand', type: 'select', labelPl: 'Marka', labelEn: 'Brand',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'apple', labelPl: 'Apple', labelEn: 'Apple' },
        { value: 'samsung', labelPl: 'Samsung', labelEn: 'Samsung' },
        { value: 'garmin', labelPl: 'Garmin', labelEn: 'Garmin' },
        { value: 'casio', labelPl: 'Casio', labelEn: 'Casio' },
        { value: 'seiko', labelPl: 'Seiko', labelEn: 'Seiko' },
        { value: 'tissot', labelPl: 'Tissot', labelEn: 'Tissot' },
        { value: 'omega', labelPl: 'Omega', labelEn: 'Omega' },
        { value: 'rolex', labelPl: 'Rolex', labelEn: 'Rolex' },
        { value: 'other', labelPl: 'Inna', labelEn: 'Other' },
      ],
    },
    {
      key: 'gender', type: 'select', labelPl: 'Plec', labelEn: 'Gender',
      required: false, filterable: true, showOnCard: false,
      options: [
        { value: 'men', labelPl: 'Meskie', labelEn: 'Men' },
        { value: 'women', labelPl: 'Damskie', labelEn: 'Women' },
        { value: 'unisex', labelPl: 'Unisex', labelEn: 'Unisex' },
      ],
    },
  ],

  bizuteria: [
    {
      key: 'jewelryType', type: 'select', labelPl: 'Typ', labelEn: 'Type',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'ring', labelPl: 'Piercionek', labelEn: 'Ring' },
        { value: 'necklace', labelPl: 'Naszyjnik', labelEn: 'Necklace' },
        { value: 'bracelet', labelPl: 'Bransoletka', labelEn: 'Bracelet' },
        { value: 'earrings', labelPl: 'Kolczyki', labelEn: 'Earrings' },
        { value: 'set', labelPl: 'Komplet', labelEn: 'Set' },
        { value: 'other', labelPl: 'Inne', labelEn: 'Other' },
      ],
    },
    {
      key: 'material', type: 'select', labelPl: 'Material', labelEn: 'Material',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'gold', labelPl: 'Zloto', labelEn: 'Gold' },
        { value: 'silver', labelPl: 'Srebro', labelEn: 'Silver' },
        { value: 'platinum', labelPl: 'Platyna', labelEn: 'Platinum' },
        { value: 'steel', labelPl: 'Stal', labelEn: 'Steel' },
        { value: 'costume', labelPl: 'Bizuteria sztuczna', labelEn: 'Costume jewelry' },
      ],
    },
  ],

  // ========== OPONY ==========
  opony: [
    {
      key: 'tireType', type: 'select', labelPl: 'Sezon', labelEn: 'Season',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: 'summer', labelPl: 'Letnie', labelEn: 'Summer' },
        { value: 'winter', labelPl: 'Zimowe', labelEn: 'Winter' },
        { value: 'allseason', labelPl: 'Calosezonowe', labelEn: 'All-season' },
      ],
    },
    {
      key: 'rimSize', type: 'select', labelPl: 'Rozmiar felgi', labelEn: 'Rim size',
      required: false, filterable: true, showOnCard: true,
      options: [
        { value: '14', labelPl: '14"', labelEn: '14"' },
        { value: '15', labelPl: '15"', labelEn: '15"' },
        { value: '16', labelPl: '16"', labelEn: '16"' },
        { value: '17', labelPl: '17"', labelEn: '17"' },
        { value: '18', labelPl: '18"', labelEn: '18"' },
        { value: '19', labelPl: '19"', labelEn: '19"' },
        { value: '20', labelPl: '20"', labelEn: '20"' },
        { value: '21', labelPl: '21"', labelEn: '21"' },
        { value: '22', labelPl: '22"', labelEn: '22"' },
      ],
    },
    { key: 'brand', type: 'text', labelPl: 'Marka', labelEn: 'Brand', required: false, filterable: false, showOnCard: true },
    { key: 'tireWidth', type: 'number', labelPl: 'Szerokosc', labelEn: 'Width', required: false, filterable: false, showOnCard: false, unit: 'mm', min: 135, max: 335 },
  ],
};

// Helper: get attributes for a category slug
export function getAttributesForCategory(slug: string): AttributeDefinition[] {
  return CATEGORY_ATTRIBUTES[slug] || [];
}

// Helper: get filterable attributes for a category slug
export function getFilterableAttributes(slug: string): AttributeDefinition[] {
  return getAttributesForCategory(slug).filter(a => a.filterable);
}

// Helper: get card-display attributes for a category slug
export function getCardAttributes(slug: string): AttributeDefinition[] {
  return getAttributesForCategory(slug).filter(a => a.showOnCard);
}

// Helper: resolve select value to localized label
export function resolveSelectLabel(options: AttributeOption[], value: string, lang: 'pl' | 'en'): string {
  const option = options.find(o => o.value === value);
  if (!option) return value;
  return lang === 'pl' ? option.labelPl : option.labelEn;
}

// Helper: format attribute value for display
export function formatAttributeValue(attr: AttributeDefinition, value: any, lang: 'pl' | 'en'): string {
  if (value === undefined || value === null || value === '') return '';
  if (attr.type === 'select' && attr.options) {
    return resolveSelectLabel(attr.options, String(value), lang);
  }
  if (attr.type === 'number' && attr.unit) {
    const num = Number(value);
    if (attr.key === 'mileage') return `${num.toLocaleString('pl-PL')} ${attr.unit}`;
    return `${num} ${attr.unit}`;
  }
  return String(value);
}
