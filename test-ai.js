// Test AI generation locally
const title = "Casa 3 quartos piscina Jardins SP 250m2";
const description = "";

const text = (title || '') + ' ' + (description || '');
const textLower = text.toLowerCase();

// Extract bedrooms
const bedroomsMatch = textLower.match(/(\d+)\s*(quarto|quart|qto|bedroom|qt)/i);
const extractedBedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : null;

// Extract bathrooms  
const bathroomsMatch = textLower.match(/(\d+)\s*(banheiro|banh|bathroom|wc|bwc)/i);
const extractedBathrooms = bathroomsMatch ? parseInt(bathroomsMatch[1]) : null;

// Extract area
const areaMatch = textLower.match(/(\d+)\s*(m²|m2|metros|metro)/i);
const extractedArea = areaMatch ? parseInt(areaMatch[1]) : null;

// Extract parking
const parkingMatch = textLower.match(/(\d+)\s*(vaga|garagem|parking|garage)/i);
const extractedParking = parkingMatch ? parseInt(parkingMatch[1]) : null;

console.log('Extracted:', {
    bedrooms: extractedBedrooms,
    bathrooms: extractedBathrooms,
    area: extractedArea,
    parking: extractedParking
});

// Generate description from title
const features = [];
if (extractedBedrooms) features.push(`${extractedBedrooms} ${extractedBedrooms > 1 ? 'quartos' : 'quarto'}`);
if (extractedBathrooms) features.push(`${extractedBathrooms} ${extractedBathrooms > 1 ? 'banheiros' : 'banheiro'}`);
if (extractedArea) features.push(`${extractedArea}m² de área`);
if (extractedParking) features.push(`${extractedParking} ${extractedParking > 1 ? 'vagas' : 'vaga'} de garagem`);

if (textLower.includes('piscina')) features.push('piscina');
if (textLower.includes('churrasqueira')) features.push('churrasqueira');

const neighborhood = 'Jardins';
const city = 'São Paulo';
const featuresText = features.length > 0 ? `com ${features.join(', ')}` : '';

const generatedDescription = `Excelente casa ${featuresText}. Localizado em ${neighborhood}, oferece conforto e praticidade para você e sua família. ${extractedArea ? `Imóvel de ${extractedArea}m²` : 'Espaço amplo'} em localização privilegiada. Agende sua visita e conheça!`;

console.log('Generated Description:', generatedDescription);

// Price estimate
const pricePerM2 = 10000; // Jardins
const estimatedPrice = Math.round(extractedArea * pricePerM2);
console.log('Estimated Price:', `R$ ${estimatedPrice.toLocaleString('pt-BR')}`);
