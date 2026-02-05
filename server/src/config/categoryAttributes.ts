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
export function resolveSelectLabel(attr: AttributeDefinition, value: string, lang: 'pl' | 'en'): string {
  if (attr.type !== 'select' || !attr.options) return value;
  const option = attr.options.find(o => o.value === value);
  if (!option) return value;
  return lang === 'pl' ? option.labelPl : option.labelEn;
}

// Helper: format attribute value for display
export function formatAttributeValue(attr: AttributeDefinition, value: any, lang: 'pl' | 'en'): string {
  if (value === undefined || value === null || value === '') return '';
  if (attr.type === 'select') return resolveSelectLabel(attr, String(value), lang);
  if (attr.type === 'number' && attr.unit) {
    const num = Number(value);
    if (attr.key === 'mileage') return `${num.toLocaleString('pl-PL')} ${attr.unit}`;
    return `${value} ${attr.unit}`;
  }
  return String(value);
}
